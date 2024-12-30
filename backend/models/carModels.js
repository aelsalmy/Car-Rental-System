const pool = require('../config/database');

const Car = {
    async findById(id) {
        const [rows] = await pool.query(`
            SELECT c.*, o.name as officeName, o.location as officeLocation, o.phone as officePhone 
            FROM cars c
            LEFT JOIN offices o ON c.officeId = o.id
            WHERE c.id = ?
        `, [id]);
        return rows[0];
    },

    async findAll(filters = {}) {
        let query = `
            SELECT c.*, o.name as officeName, o.location as officeLocation, o.phone as officePhone 
            FROM cars c
            LEFT JOIN offices o ON c.officeId = o.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ' AND c.status = ?';
            params.push(filters.status);
        }

        if (filters.category) {
            query += ' AND c.category = ?';
            params.push(filters.category);
        }

        const [rows] = await pool.query(query, params);
        return rows;
    },

    async create(carData) {
        const [result] = await pool.query(`
            INSERT INTO cars (
                model, year, plateId, status, officeId, dailyRate, 
                category, transmission, fuelType, seatingCapacity, 
                features, description, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            carData.model,
            carData.year,
            carData.plateId,
            carData.status || 'active',
            carData.officeId,
            carData.dailyRate,
            carData.category,
            carData.transmission,
            carData.fuelType,
            carData.seatingCapacity,
            JSON.stringify(carData.features || {}),
            carData.description
        ]);
        return { id: result.insertId, ...carData };
    },

    async update(id, carData) {
        const [result] = await pool.query(`
            UPDATE cars 
            SET model = ?, year = ?, plateId = ?, status = ?, 
                officeId = ?, dailyRate = ?, category = ?, 
                transmission = ?, fuelType = ?, seatingCapacity = ?, 
                features = ?, description = ?, updatedAt = NOW()
            WHERE id = ?
        `, [
            carData.model,
            carData.year,
            carData.plateId,
            carData.status,
            carData.officeId,
            carData.dailyRate,
            carData.category,
            carData.transmission,
            carData.fuelType,
            carData.seatingCapacity,
            JSON.stringify(carData.features || {}),
            carData.description,
            id
        ]);
        return result.affectedRows > 0;
    }
};

const Customer = {
    async findById(id) {
        const [rows] = await pool.query(`
            SELECT c.*, u.username, u.user_role
            FROM customers c
            LEFT JOIN user u ON c.userId = u.id
            WHERE c.id = ?
        `, [id]);
        return rows[0];
    },

    async create(customerData) {
        const [result] = await pool.query(`
            INSERT INTO customers (
                name, email, phone, address, userId, 
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            customerData.name,
            customerData.email,
            customerData.phone,
            customerData.address,
            customerData.userId
        ]);
        return { id: result.insertId, ...customerData };
    },

    async findByUserId(userId) {
        const [rows] = await pool.query('SELECT * FROM customers WHERE userId = ?', [userId]);
        return rows[0];
    }
};

const Office = {
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM offices WHERE id = ?', [id]);
        return rows[0];
    },

    async findAll() {
        const [rows] = await pool.query('SELECT * FROM offices');
        return rows;
    },

    async create(officeData) {
        const [result] = await pool.query(`
            INSERT INTO offices (
                name, location, phone, createdAt, updatedAt
            ) VALUES (?, ?, ?, NOW(), NOW())
        `, [officeData.name, officeData.location, officeData.phone]);
        return { id: result.insertId, ...officeData };
    }
};

const Reservation = {
    async findById(id) {
        const [rows] = await pool.query(`
            SELECT r.*, 
                c.model as carModel, c.plateId,
                cust.name as customerName,
                p.amount as paymentAmount, p.paymentStatus
            FROM reservations r
            LEFT JOIN cars c ON r.carId = c.id
            LEFT JOIN customers cust ON r.customerId = cust.id
            LEFT JOIN payments p ON p.reservationId = r.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    },

    async create(reservationData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check if car is available
            const [carCheck] = await connection.query(
                'SELECT status FROM cars WHERE id = ? FOR UPDATE',
                [reservationData.carId]
            );

            if (!carCheck[0] || carCheck[0].status === 'out_of_service') {
                throw new Error('Car is not available for reservation');
            }

            // Check for overlapping reservations
            const [overlapping] = await connection.query(`
                SELECT id FROM reservations 
                WHERE carId = ? 
                AND status = 'active'
                AND (
                    (? BETWEEN startDate AND endDate)
                    OR (? BETWEEN startDate AND endDate)
                )
            `, [
                reservationData.carId,
                reservationData.startDate,
                reservationData.endDate
            ]);

            if (overlapping.length > 0) {
                throw new Error('Car already has an active reservation for these dates');
            }

            // Create reservation
            const [result] = await connection.query(`
                INSERT INTO reservations (
                    carId, customerId, startDate, endDate, status,
                    createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                reservationData.carId,
                reservationData.customerId,
                reservationData.startDate,
                reservationData.endDate,
                reservationData.status || 'pending'
            ]);

            await connection.commit();
            return { id: result.insertId, ...reservationData };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async update(id, reservationData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (reservationData.status === 'active') {
                // Check for overlapping active reservations
                const [overlapping] = await connection.query(`
                    SELECT id FROM reservations 
                    WHERE carId = ? 
                    AND id != ?
                    AND status = 'active'
                    AND (
                        (? BETWEEN startDate AND endDate)
                        OR (? BETWEEN startDate AND endDate)
                    )
                `, [
                    reservationData.carId,
                    id,
                    reservationData.startDate,
                    reservationData.endDate
                ]);

                if (overlapping.length > 0) {
                    throw new Error('Cannot activate reservation - there is an overlapping active reservation');
                }
            }

            const [result] = await connection.query(`
                UPDATE reservations 
                SET status = ?, startDate = ?, endDate = ?, updatedAt = NOW()
                WHERE id = ?
            `, [
                reservationData.status,
                reservationData.startDate,
                reservationData.endDate,
                id
            ]);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

const Payment = {
    async findById(id) {
        const [rows] = await pool.query(`
            SELECT p.*, r.startDate, r.endDate, c.model as carModel
            FROM payments p
            LEFT JOIN reservations r ON p.reservationId = r.id
            LEFT JOIN cars c ON r.carId = c.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    },

    async create(paymentData) {
        const [result] = await pool.query(`
            INSERT INTO payments (
                reservationId, amount, paymentDate, paymentMethod, 
                paymentStatus, createdAt, updatedAt
            ) VALUES (?, ?, NOW(), ?, ?, NOW(), NOW())
        `, [
            paymentData.reservationId,
            paymentData.amount,
            paymentData.paymentMethod,
            paymentData.paymentStatus || 'unpaid'
        ]);
        return { id: result.insertId, ...paymentData };
    },

    async update(id, paymentData) {
        const [result] = await pool.query(`
            UPDATE payments 
            SET paymentStatus = ?, paymentMethod = ?, 
                amount = ?, updatedAt = NOW()
            WHERE id = ?
        `, [
            paymentData.paymentStatus,
            paymentData.paymentMethod,
            paymentData.amount,
            id
        ]);
        return result.affectedRows > 0;
    }
};

module.exports = {
    Car,
    Customer,
    Office,
    Reservation,
    Payment
};