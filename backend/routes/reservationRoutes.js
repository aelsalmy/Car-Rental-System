const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Helper function to format date for MySQL
function formatDateForMySQL(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

router.post('/', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { carId, startDate, endDate, paymentMethod, paymentStatus, totalCost } = req.body;
        const userid = req.user.id;

        // Format dates for MySQL
        const formattedStartDate = formatDateForMySQL(startDate);
        const formattedEndDate = formatDateForMySQL(endDate);

        await connection.beginTransaction();

        // Check if car exists and is available
        const [cars] = await connection.execute(
            'SELECT * FROM cars WHERE id = ?',
            [carId]
        );

        if (cars.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Car not available' });
        }

        // Check for overlapping reservations
        const [overlapping] = await connection.execute(`
            SELECT * FROM reservations 
            WHERE carId = ? 
            AND status NOT IN ('cancelled', 'completed')
            AND (
                (startDate BETWEEN ? AND ?) OR
                (endDate BETWEEN ? AND ?) OR
                (startDate <= ? AND endDate >= ?)
            )`,
            [carId, formattedStartDate, formattedEndDate, formattedStartDate, formattedEndDate, formattedStartDate, formattedEndDate]
        );

        const [customers] = await connection.execute(
            'SELECT * FROM customers WHERE userId = ?',
            [userid]
        );

        if (overlapping.length > 0) {
            await connection.rollback();
            return res.status(400).json({ 
                message: `This car is already reserved for these dates. Please end your reservation before ${new Date(overlapping[0].startDate).toLocaleDateString()}` 
            });
        }

        if (customers.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customers[0].id;

        // Create reservation with pending status
        const [reservationResult] = await connection.execute(
            `INSERT INTO reservations (carId, customerId, startDate, endDate, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
            [carId, customerId, formattedStartDate, formattedEndDate]
        );

        // Create payment record
        await connection.execute(
            `INSERT INTO payments (reservationId, amount, paymentMethod, paymentStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [reservationResult.insertId, totalCost, paymentMethod, paymentStatus]
        );

        // Update car status to 'reserved'
        await connection.execute(
            `UPDATE cars SET status = 'reserved' WHERE id = ?`,
            [carId]
        );

        await connection.commit();

        const [newReservation] = await connection.execute(
            'SELECT * FROM reservations WHERE id = ?',
            [reservationResult.insertId]
        );

        res.status(201).json(newReservation[0]);
    } catch (error) {
        await connection.rollback();
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Error creating reservation: ' + error.message });
    } finally {
        connection.release();
    }
});

router.get('/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get the customer ID associated with the user
        const [customers] = await pool.execute(
            'SELECT * FROM customers WHERE userId = ?',
            [userId]
        );

        if (customers.length === 0) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customers[0].id;

        const [reservations] = await pool.execute(`
            SELECT 
                r.*,
                c.*,
                o.*,
                p.amount as payment_amount,
                p.paymentMethod as payment_method,
                p.paymentStatus as payment_status,
                c.id as car_id,
                o.id as office_id,
                r.id as reservation_id
            FROM reservations r
            LEFT JOIN cars c ON r.carId = c.id
            LEFT JOIN offices o ON c.officeId = o.id
            LEFT JOIN payments p ON r.id = p.reservationId
            WHERE r.customerId = ?
            ORDER BY r.createdAt DESC
        `, [customerId]);

        // Format the response to match the previous structure
        const formattedReservations = reservations.map(reservation => ({
            id: reservation.reservation_id,
            carId: reservation.car_id,
            customerId: reservation.customerId,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            status: reservation.status,
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
            Car: {
                id: reservation.car_id,
                model: reservation.model,
                year: reservation.year,
                plateId: reservation.plateId,
                status: reservation.status,
                officeId: reservation.officeId,
                dailyRate: reservation.dailyRate,
                category: reservation.category,
                transmission: reservation.transmission,
                fuelType: reservation.fuelType,
                seatingCapacity: reservation.seatingCapacity,
                features: reservation.features,
                description: reservation.description,
                Office: {
                    id: reservation.office_id,
                    name: reservation.name,
                    location: reservation.location,
                    phone: reservation.phone
                }
            },
            Payment: {
                amount: reservation.payment_amount,
                paymentMethod: reservation.payment_method,
                paymentStatus: reservation.payment_status
            }
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Failed to fetch reservations' });
    }
});

router.patch('/:id/cancel', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const userId = req.user.id;

        await connection.beginTransaction();

        // Get the customer ID associated with the user
        const [customers] = await connection.execute(
            'SELECT * FROM customers WHERE userId = ?',
            [userId]
        );

        if (customers.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customers[0].id;

        const [reservations] = await connection.execute(
            'SELECT * FROM reservations WHERE id = ? AND customerId = ?',
            [req.params.id, customerId]
        );

        if (reservations.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = reservations[0];

        if (reservation.status !== 'pending' && reservation.status !== 'active') {
            await connection.rollback();
            return res.status(400).json({ message: 'Cannot cancel this reservation' });
        }

        await connection.execute(
            'UPDATE reservations SET status = ?, updatedAt = NOW() WHERE id = ?',
            ['cancelled', req.params.id]
        );

        await connection.commit();

        const [updatedReservation] = await connection.execute(
            'SELECT * FROM reservations WHERE id = ?',
            [req.params.id]
        );

        res.json(updatedReservation[0]);
    } catch (error) {
        await connection.rollback();
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ message: 'Failed to cancel reservation' });
    } finally {
        connection.release();
    }
});

router.delete('/:id/delete', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [reservations] = await connection.execute(
            'SELECT * FROM reservations WHERE id = ? AND customerId = ?',
            [req.params.id, req.user.id]
        );

        if (reservations.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Reservation not found' });
        }

        await connection.execute(
            'DELETE FROM reservations WHERE id = ? AND customerId = ?',
            [req.params.id, req.user.id]
        );

        await connection.commit();
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Failed to delete reservation' + error});
    } finally {
        connection.release();
    }
});

router.get('/getAll', authenticateAdmin, async (req, res) => {
    try {
        const [reservations] = await pool.execute(`
            SELECT 
                r.*,
                c.*,
                o.*,
                cu.name as customer_name,
                cu.email as customer_email,
                cu.phone as customer_phone,
                cu.address as customer_address,
                p.amount as payment_amount,
                p.paymentMethod as payment_method,
                p.paymentStatus as payment_status,
                c.id as car_id,
                o.id as office_id,
                r.id as reservation_id
            FROM reservations r
            LEFT JOIN cars c ON r.carId = c.id
            LEFT JOIN offices o ON c.officeId = o.id
            LEFT JOIN customers cu ON r.customerId = cu.id
            LEFT JOIN payments p ON r.id = p.reservationId
            ORDER BY r.createdAt DESC
        `);

        // Format the response to match the previous structure
        const formattedReservations = reservations.map(reservation => ({
            id: reservation.reservation_id,
            carId: reservation.car_id,
            customerId: reservation.customerId,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            status: reservation.status,
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
            Car: {
                id: reservation.car_id,
                model: reservation.model,
                year: reservation.year,
                plateId: reservation.plateId,
                status: reservation.status,
                officeId: reservation.officeId,
                dailyRate: reservation.dailyRate,
                category: reservation.category,
                transmission: reservation.transmission,
                fuelType: reservation.fuelType,
                seatingCapacity: reservation.seatingCapacity,
                features: reservation.features,
                description: reservation.description,
                Office: {
                    id: reservation.office_id,
                    name: reservation.name,
                    location: reservation.location,
                    phone: reservation.phone
                }
            },
            Customer: {
                name: reservation.customer_name,
                email: reservation.customer_email,
                phone: reservation.customer_phone,
                address: reservation.customer_address
            },
            Payment: {
                amount: reservation.payment_amount,
                paymentMethod: reservation.payment_method,
                paymentStatus: reservation.payment_status
            }
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error fetching all reservations:', error);
        res.status(500).json({ message: 'Failed to fetch reservations' });
    }
});

router.patch('/:id/status', authenticateAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { status } = req.body;
        const reservationId = req.params.id;

        // Get the current reservation
        const [currentReservation] = await connection.execute(
            'SELECT * FROM reservations WHERE id = ?',
            [reservationId]
        );

        if (currentReservation.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Update reservation status
        await connection.execute(
            'UPDATE reservations SET status = ? WHERE id = ?',
            [status, reservationId]
        );

        // If status is 'active', update car status to 'rented'
        if (status === 'active') {
            await connection.execute(
                'UPDATE cars SET status = ? WHERE id = ?',
                ['rented', currentReservation[0].carId]
            );
        }
        // If status is 'completed' or 'cancelled', update car status to 'active'
        else if (status === 'completed' || status === 'cancelled') {
            await connection.execute(
                'UPDATE cars SET status = ? WHERE id = ?',
                ['active', currentReservation[0].carId]
            );
        }

        res.json({ message: 'Reservation status updated successfully' });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ message: 'Error updating reservation status' });
    } finally {
        connection.release();
    }
});

router.patch('/car/:carId/status', authenticateAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { carId } = req.params;
        const { status } = req.body;

        await connection.beginTransaction();

        // Only allow setting to out_of_service
        if (status !== 'out_of_service') {
            await connection.rollback();
            return res.status(400).json({ message: 'Can only set cars to out of service status' });
        }

        // Check for active reservations
        const [activeReservations] = await connection.execute(`
            SELECT * FROM reservations 
            WHERE carId = ? 
            AND status IN ('pending', 'active')
            AND startDate <= NOW()
            AND endDate > NOW()
        `, [carId]);

        if (activeReservations.length > 0) {
            await connection.rollback();
            return res.status(400).json({ 
                message: 'Cannot update car status - there is an active reservation until ' + 
                        new Date(activeReservations[0].endDate).toLocaleDateString() 
            });
        }

        // Check if car exists
        const [cars] = await connection.execute(
            'SELECT * FROM cars WHERE id = ?',
            [carId]
        );

        if (cars.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Car not found' });
        }

        // Update car status
        await connection.execute(
            'UPDATE cars SET status = ?, updatedAt = NOW() WHERE id = ?',
            ['out_of_service', carId]
        );

        await connection.commit();
        res.json({ message: 'Car status updated to out of service' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating car status:', error);
        res.status(500).json({ message: 'Error updating car status' });
    } finally {
        connection.release();
    }
});

router.get('/search', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate, status, currentlyRented } = req.query;
        
        let query = `
            SELECT 
                r.*,
                c.*,
                o.*,
                cu.name as customer_name,
                cu.email as customer_email,
                cu.phone as customer_phone,
                cu.address as customer_address,
                p.amount as payment_amount,
                p.paymentMethod as payment_method,
                p.paymentStatus as payment_status,
                c.id as car_id,
                o.id as office_id,
                r.id as reservation_id
            FROM reservations r
            LEFT JOIN cars c ON r.carId = c.id
            LEFT JOIN offices o ON c.officeId = o.id
            LEFT JOIN customers cu ON r.customerId = cu.id
            LEFT JOIN payments p ON r.id = p.reservationId
            WHERE 1=1
        `;
        const params = [];

        if (currentlyRented === 'true') {
            const currentDate = new Date().toISOString().split('T')[0];
            query += ` AND r.startDate <= ? AND r.endDate >= ? AND r.status = 'active'`;
            params.push(currentDate, currentDate);
        } else {
            if (startDate && endDate) {
                query += ` AND r.startDate = ? AND r.endDate = ?`;
                params.push(startDate, endDate);
            } else if (startDate) {
                query += ` AND r.startDate = ?`;
                params.push(startDate);
            } else if (endDate) {
                query += ` AND r.endDate = ?`;
                params.push(endDate);
            }
            
            if (status) {
                query += ` AND r.status = ?`;
                params.push(status);
            }
        }

        query += ` ORDER BY r.startDate DESC`;

        const [reservations] = await pool.execute(query, params);

        // Format the response to match the previous structure
        const formattedReservations = reservations.map(reservation => ({
            id: reservation.reservation_id,
            carId: reservation.car_id,
            customerId: reservation.customerId,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            status: reservation.status,
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
            Car: {
                id: reservation.car_id,
                model: reservation.model,
                year: reservation.year,
                plateId: reservation.plateId,
                status: reservation.status,
                officeId: reservation.officeId,
                dailyRate: reservation.dailyRate,
                category: reservation.category,
                transmission: reservation.transmission,
                fuelType: reservation.fuelType,
                seatingCapacity: reservation.seatingCapacity,
                features: reservation.features,
                description: reservation.description,
                Office: {
                    id: reservation.office_id,
                    name: reservation.name,
                    location: reservation.location,
                    phone: reservation.phone
                }
            },
            Customer: {
                name: reservation.customer_name,
                email: reservation.customer_email,
                phone: reservation.customer_phone,
                address: reservation.customer_address
            },
            Payment: {
                amount: reservation.payment_amount,
                paymentMethod: reservation.payment_method,
                paymentStatus: reservation.payment_status
            }
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error searching reservations:', error);
        res.status(500).json({ message: 'Failed to search reservations' });
    }
});

router.get('/customers', authenticateAdmin, async (req, res) => {
    try {
        const [customers] = await pool.execute(
            'SELECT * FROM customers ORDER BY createdAt DESC'
        );
        res.json(customers);
    } catch (error) {
        console.error('Error fetching all customers:', error);
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
});

module.exports = router;