const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Get car reservation report
router.get('/car', authenticateAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { carId, startDate, endDate } = req.query;
        
        let query = `
            SELECT 
                r.id, r.carId, r.customerId, r.startDate, r.endDate, r.status, r.createdAt, r.updatedAt,
                c.model, c.year, c.plateId, c.status as carStatus, c.dailyRate, c.category, c.transmission, c.fuelType,
                o.id as officeId, o.name as officeName, o.location as officeLocation, o.phone as officePhone,
                cust.id as customerId, cust.name as customerName, cust.email as customerEmail, cust.phone as customerPhone, cust.address as customerAddress,
                p.id as paymentId, p.amount as paymentAmount, p.paymentMethod, p.paymentStatus
            FROM reservations r
            LEFT JOIN cars c ON r.carId = c.id
            LEFT JOIN offices o ON c.officeId = o.id
            LEFT JOIN customers cust ON r.customerId = cust.id
            LEFT JOIN payments p ON r.id = p.reservationId
            WHERE 1=1
        `;

        const params = [];

        if (carId) {
            query += ' AND r.carId = ?';
            params.push(carId);
        }

        if (startDate) {
            query += ' AND DATE(r.startDate) = ?';
            params.push(startDate.split('T')[0]);
        }

        if (endDate) {
            query += ' AND DATE(r.endDate) = ?';
            params.push(endDate.split('T')[0]);
        }

        query += ' ORDER BY r.startDate DESC';

        const [reservations] = await connection.query(query, params);

        // Transform the flat results into nested objects
        const formattedReservations = reservations.map(row => ({
            id: row.id,
            carId: row.carId,
            customerId: row.customerId,
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Car: {
                id: row.carId,
                model: row.model,
                year: row.year,
                plateId: row.plateId,
                status: row.carStatus,
                dailyRate: row.dailyRate,
                category: row.category,
                transmission: row.transmission,
                fuelType: row.fuelType,
                Office: {
                    id: row.officeId,
                    name: row.officeName,
                    location: row.officeLocation,
                    phone: row.officePhone
                }
            },
            Customer: {
                id: row.customerId,
                name: row.customerName,
                email: row.customerEmail,
                phone: row.customerPhone,
                address: row.customerAddress
            },
            Payment: {
                id: row.paymentId,
                amount: row.paymentAmount,
                paymentMethod: row.paymentMethod,
                paymentStatus: row.paymentStatus
            }
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error generating car reservation report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    } finally {
        connection.release();
    }
});

// Get detailed reservation report
router.get('/reservation', authenticateAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { startDate, endDate } = req.query;
        
        let query = `
            SELECT 
                r.id, r.carId, r.customerId, r.startDate, r.endDate, r.status, r.createdAt, r.updatedAt,
                c.model, c.year, c.plateId, c.status as carStatus, c.dailyRate, c.category, c.transmission, c.fuelType,
                o.id as officeId, o.name as officeName, o.location as officeLocation, o.phone as officePhone,
                cust.id as customerId, cust.name as customerName, cust.email as customerEmail, cust.phone as customerPhone, cust.address as customerAddress,
                p.id as paymentId, p.amount as paymentAmount, p.paymentMethod, p.paymentStatus
            FROM reservations r
            LEFT JOIN cars c ON r.carId = c.id
            LEFT JOIN offices o ON c.officeId = o.id
            LEFT JOIN customers cust ON r.customerId = cust.id
            LEFT JOIN payments p ON r.id = p.reservationId
            WHERE 1=1
        `;

        const params = [];

        if (startDate) {
            query += ' AND DATE(r.startDate) = ?';
            params.push(startDate.split('T')[0]);
        }

        if (endDate) {
            query += ' AND DATE(r.endDate) = ?';
            params.push(endDate.split('T')[0]);
        }

        query += ' ORDER BY r.startDate DESC';

        const [reservations] = await connection.query(query, params);

        // Transform the flat results into nested objects
        const formattedReservations = reservations.map(row => ({
            id: row.id,
            carId: row.carId,
            customerId: row.customerId,
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Car: {
                id: row.carId,
                model: row.model,
                year: row.year,
                plateId: row.plateId,
                status: row.carStatus,
                dailyRate: row.dailyRate,
                category: row.category,
                transmission: row.transmission,
                fuelType: row.fuelType,
                Office: {
                    id: row.officeId,
                    name: row.officeName,
                    location: row.officeLocation,
                    phone: row.officePhone
                }
            },
            Customer: {
                id: row.customerId,
                name: row.customerName,
                email: row.customerEmail,
                phone: row.customerPhone,
                address: row.customerAddress
            },
            Payment: {
                id: row.paymentId,
                amount: row.paymentAmount,
                paymentMethod: row.paymentMethod,
                paymentStatus: row.paymentStatus
            }
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error generating reservation report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    } finally {
        connection.release();
    }
});

router.get('/status', authenticateAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { status, date } = req.query;
        const carMap = new Map();

        let params = [];

        if (status === 'rented') {
            let query = `
                SELECT 
                    r.id as reservationId, r.startDate, r.endDate, r.status as reservationStatus,
                    c.id as carId, c.model as model , c.year as modelYear , c.plateId as plateId, 
                    o.id as officeId, o.name as officeName, o.location as officeLocation, o.phone as officePhone,
                    cust.name as customerName , cust.phone as customerPhone , cust.email as customerEmail
                FROM reservations r
                JOIN cars c ON r.carId = c.id
                LEFT JOIN offices o ON c.officeId = o.id
                LEFT JOIN customers as cust ON cust.id = r.customerId
                WHERE r.status = 'active'
            `;

            if (date) {
                query += ` AND DATE(?) BETWEEN DATE(r.startDate) AND DATE(r.endDate)`;
                params.push(date);
            }

            const [rentedCars] = await connection.query(query, params);

            rentedCars.forEach(car => {
                carMap.set(car.carId, {
                    id: car.carId,
                    model: car.model,
                    year: car.modelYear,
                    plateId: car.plateId,
                    status: 'rented',
                    Customer: {
                        name: car.customerName,
                        email: car.customerEmail,
                        phone: car.customerPhone
                    },
                    Office: {
                        id: car.officeId,
                        name: car.officeName,
                        location: car.officeLocation,
                        phone: car.officePhone
                    }
                });
            });
        } else if (status === 'out_of_service') {
            const [outOfServiceCars] = await connection.query(`
                SELECT 
                    c.model as model, c.year as modelYear , c.plateId as plateId ,
                    o.id as officeId, o.name as officeName, o.location as officeLocation, o.phone as officePhone
                FROM cars c
                LEFT JOIN offices o ON c.officeId = o.id
                WHERE c.status = ?
            `, [status]);

            outOfServiceCars.forEach(car => {
                carMap.set(car.carId, {
                    id: car.carId,
                    model: car.model,
                    year: car.modelYear,
                    plateId: car.plateId,
                    status: 'out_of_service',
                    Customer: {
                        name: car.customerName || null,
                        email: car.customerEmail || null,
                        phone: car.customerPhone || null
                    },
                    Office: {
                        id: car.officeId,
                        name: car.officeName,
                        location: car.officeLocation,
                        phone: car.officePhone
                    }
                });
            });
        } else {
            if(status === 'active'){
                let query = `
                    SELECT 
                        c.id as carId, c.model as model, c.year as modelYear, c.plateId as plateId, 
                        o.id as officeId, o.name as officeName, o.location as officeLocation, o.phone as officePhone
                    FROM cars c
                    LEFT JOIN offices o ON c.officeId = o.id
                    LEFT JOIN reservations r ON r.carId = c.id AND r.status = 'active'
                    WHERE r.id IS NULL  -- No active reservation
                `;
            
                // If a specific date is provided, add logic to check availability on that date
                if (date) {
                    query += ` OR (DATE(?) NOT BETWEEN DATE(r.startDate) AND DATE(r.endDate))`;
                    params.push(date);
                }

                const [availableCars] = await connection.query(query, params);

                availableCars.forEach(car => {
                    carMap.set(car.carId, {
                        id: car.carId,
                        model: car.model,
                        year: car.modelYear,
                        plateId: car.plateId,
                        status: 'active',
                        Customer: {
                            name: null,
                            email: null,
                            phone: null
                        },
                        Office: {
                            id: car.officeId,
                            name: car.officeName,
                            location: car.officeLocation,
                            phone: car.officePhone
                        }
                    });
                });

            } else {
                // Get all cars if no specific status is provided
                let query = `
                    SELECT DISTINCT
                        car.id as carId , car.model as model, car.year as modelYear , car.plateId as plateId, car.status as carStatus,
                        c.name as customerName, c.email as customerEmail, c.phone as customerPhone, 
                        o.name as officeName , o.location as officeLocation,
                        r.id as reservationId, r.startDate, r.endDate, r.status as reservationStatus
                    FROM cars as car
                    LEFT JOIN reservations as r ON car.id = r.carId
                    LEFT JOIN customers as c ON c.id = r.customerId
                    LEFT JOIN offices as o ON car.officeId = o.id
                `;

                const params = [];

                const [allCars] = await connection.query(query, params);

                allCars.forEach(car => {
                    carMap.set(car.carId, {
                        id: car.carId,
                        model: car.model,
                        year: car.modelYear,
                        plateId: car.plateId,
                        status: car.reservationId ? 'rented' : car.carStatus,
                        Customer: {
                            name: car.customerName,
                            email: car.customerEmail,
                            phone: car.customerPhone
                        },
                        Office: {
                            id: car.officeId,
                            name: car.officeName,
                            location: car.officeLocation,
                            phone: car.officePhone
                        }
                    });
                });
            }
        }

        const cars = Array.from(carMap.values());
        res.json(cars);

    } catch (error) {
        console.error('Error generating car status report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    } finally {
        connection.release();
    }
});

router.get('/customer', authenticateAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { customerId } = req.query;

        let query = `
            SELECT 
                r.id, r.carId, r.customerId, r.startDate, r.endDate, r.status, r.createdAt, r.updatedAt,
                c.model, c.year, c.plateId, c.status as carStatus, c.dailyRate, c.category, c.transmission, c.fuelType,
                o.id as officeId, o.name as officeName, o.location as officeLocation, o.phone as officePhone,
                cust.id as customerId, cust.name as customerName, cust.email as customerEmail, cust.phone as customerPhone, cust.address as customerAddress,
                p.id as paymentId, p.amount as paymentAmount, p.paymentMethod, p.paymentStatus
            FROM reservations r
            LEFT JOIN cars c ON r.carId = c.id
            LEFT JOIN offices o ON c.officeId = o.id
            LEFT JOIN customers cust ON r.customerId = cust.id
            LEFT JOIN payments p ON r.id = p.reservationId
            WHERE r.customerId = ?
            ORDER BY r.startDate DESC
        `;

        const [reservations] = await connection.query(query, [customerId]);

        // Transform the flat results into nested objects
        const formattedReservations = reservations.map(row => ({
            id: row.id,
            carId: row.carId,
            customerId: row.customerId,
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            Car: {
                id: row.carId,
                model: row.model,
                year: row.year,
                plateId: row.plateId,
                status: row.carStatus,
                dailyRate: row.dailyRate,
                category: row.category,
                transmission: row.transmission,
                fuelType: row.fuelType,
                Office: {
                    id: row.officeId,
                    name: row.officeName,
                    location: row.officeLocation,
                    phone: row.officePhone
                }
            },
            Customer: {
                id: row.customerId,
                name: row.customerName,
                email: row.customerEmail,
                phone: row.customerPhone,
                address: row.customerAddress
            },
            Payment: {
                id: row.paymentId,
                amount: row.paymentAmount,
                paymentMethod: row.paymentMethod,
                paymentStatus: row.paymentStatus
            }
        }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error generating customer report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    } finally {
        connection.release();
    }
});

router.get('/payment', authenticateAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                p.id, p.amount, p.paymentMethod, p.paymentStatus, p.updatedAt,
                r.id as reservationId, r.startDate, r.endDate,
                c.model, c.year, c.plateId, c.officeId,
                cust.id as customerId, cust.name as customerName, cust.phone as customerPhone, cust.email as customerEmail,
                o.id as officeId, o.name as officeName, o.location as officeLocation, o.phone as officePhone
            FROM payments p
            JOIN reservations r ON p.reservationId = r.id
            JOIN cars c ON r.carId = c.id
            JOIN customers cust ON r.customerId = cust.id
            LEFT JOIN offices o ON c.officeId = o.id
            WHERE p.paymentStatus = 'paid'
        `;

        const params = [];

        if (startDate) {
            query += ' AND DATE(p.updatedAt) >= ?';
            params.push(startDate.split('T')[0]);
        }

        if (endDate) {
            query += ' AND DATE(p.updatedAt) <= ?';
            params.push(endDate.split('T')[0]);
        }

        query += ' ORDER BY p.updatedAt DESC';

        console.log('Executing query:', query);
        console.log('With params:', params);

        const [payments] = await connection.query(query, params);

        console.log('Raw payment data:', payments);

        // Transform the flat results into nested objects
        const formattedPayments = payments.map(row => ({
            id: row.id,
            amount: row.amount,
            paymentMethod: row.paymentMethod,
            paymentStatus: row.paymentStatus,
            updatedAt: row.updatedAt,
            Car: {
                model: row.model,
                year: row.year,
                plateId: row.plateId,
                officeId: row.officeId,
                Office: row.officeId ? {
                    id: row.officeId,
                    name: row.officeName,
                    location: row.officeLocation,
                    phone: row.officePhone
                } : null
            },
            Customer: {
                id: row.customerId,
                name: row.customerName,
                phone: row.customerPhone,
                email: row.customerEmail
            }
        }));

        console.log('Formatted payments:', JSON.stringify(formattedPayments, null, 2));
        res.json(formattedPayments);
    } catch (error) {
        console.error('Error generating payment report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;