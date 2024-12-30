const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching car details for id:', req.params.id);
        const [cars] = await pool.execute(`
            SELECT c.*, o.id as office_id, o.name as office_name, o.location as office_location 
            FROM cars c
            LEFT JOIN offices o ON c.officeId = o.id
            WHERE c.id = ?
        `, [req.params.id]);

        if (cars.length === 0) {
            console.log('Car not found');
            return res.status(404).json({ message: 'Car not found' });
        }

        const car = cars[0];
        // Format the response to match the previous structure
        const formattedCar = {
            ...car,
            Office: {
                id: car.office_id,
                name: car.office_name,
                location: car.office_location
            }
        };
        
        // Remove the duplicate office fields
        delete formattedCar.office_id;
        delete formattedCar.office_name;
        delete formattedCar.office_location;

        console.log('Car details found:', formattedCar);
        res.json(formattedCar);
    } catch (error) {
        console.error('Error fetching car details:', error);
        res.status(500).json({ message: 'Failed to fetch car details' });
    }
});

router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { 
            model, 
            year, 
            plateId, 
            status, 
            officeId, 
            dailyRate,
            category,
            transmission,
            fuelType,
            seatingCapacity,
            features,
            description 
        } = req.body;

        await connection.beginTransaction();

        // Check if plate ID already exists
        const [existingCars] = await connection.execute(
            'SELECT id FROM cars WHERE plateId = ?',
            [plateId]
        );

        if (existingCars.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Car with this plate ID already exists' });
        }

        // Check if office exists
        const [offices] = await connection.execute(
            'SELECT id FROM offices WHERE id = ?',
            [officeId]
        );

        if (offices.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid office ID' });
        }

        const [result] = await connection.execute(
            `INSERT INTO cars (
                model, year, plateId, status, officeId, dailyRate,
                category, transmission, fuelType, seatingCapacity,
                features, description, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                model, year, plateId, 
                status || 'active', 
                officeId, dailyRate,
                category, transmission, fuelType, 
                seatingCapacity,
                JSON.stringify(features), description
            ]
        );

        await connection.commit();

        // Fetch the created car with office details
        const [newCar] = await connection.execute(`
            SELECT c.*, o.name as office_name, o.location as office_location 
            FROM cars c
            LEFT JOIN offices o ON c.officeId = o.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json(newCar[0]);
    } catch (error) {
        await connection.rollback();
        console.error('Error registering car:', error);
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
});

router.patch('/:id/status', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { status } = req.body;

        await connection.beginTransaction();

        const [cars] = await connection.execute(
            'SELECT id FROM cars WHERE id = ?',
            [id]
        );

        if (cars.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Car not found' });
        }

        await connection.execute(
            'UPDATE cars SET status = ?, updatedAt = NOW() WHERE id = ?',
            [status, id]
        );

        await connection.commit();

        const [updatedCar] = await connection.execute(
            'SELECT * FROM cars WHERE id = ?',
            [id]
        );

        res.json(updatedCar[0]);
    } catch (error) {
        await connection.rollback();
        console.error('Error updating car status:', error);
        res.status(500).json({ message: 'Failed to update car status' });
    } finally {
        connection.release();
    }
});

router.get('/', async (req, res) => {
    try {
        console.log('Fetching cars from database...');
        const [cars] = await pool.execute(`
            SELECT c.*, o.id as office_id, o.name as office_name, o.location as office_location 
            FROM cars c
            LEFT JOIN offices o ON c.officeId = o.id
            ORDER BY c.id ASC
        `);

        // Format the response to match the previous structure
        const formattedCars = cars.map(car => ({
            ...car,
            Office: {
                id: car.office_id,
                name: car.office_name,
                location: car.office_location
            }
        })).map(car => {
            delete car.office_id;
            delete car.office_name;
            delete car.office_location;
            return car;
        });

        res.json(formattedCars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ message: 'Failed to fetch cars' });
    }
});

// Advanced search endpoint
router.get('/search', async (req, res) => {
    try {
        const {
            searchTerm,
            category,
            transmission,
            fuelType,
            minSeats,
            maxSeats,
            features,
            minPrice,
            maxPrice,
            officeId
        } = req.query;

        let query = `
            SELECT c.*, o.id as office_id, o.name as office_name, o.location as office_location 
            FROM cars c
            LEFT JOIN offices o ON c.officeId = o.id
            WHERE c.status = 'active'
        `;
        const params = [];

        // Basic search term (searches in model and description)
        if (searchTerm) {
            query += ` AND (c.model LIKE ? OR c.description LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Category filter
        if (category) {
            query += ` AND c.category = ?`;
            params.push(category);
        }

        // Transmission filter
        if (transmission) {
            query += ` AND c.transmission = ?`;
            params.push(transmission);
        }

        // Fuel type filter
        if (fuelType) {
            query += ` AND c.fuelType = ?`;
            params.push(fuelType);
        }

        // Seating capacity range
        if (minSeats) {
            query += ` AND c.seatingCapacity >= ?`;
            params.push(parseInt(minSeats));
        }
        if (maxSeats) {
            query += ` AND c.seatingCapacity <= ?`;
            params.push(parseInt(maxSeats));
        }

        // Price range
        if (minPrice) {
            query += ` AND c.dailyRate >= ?`;
            params.push(parseFloat(minPrice));
        }
        if (maxPrice) {
            query += ` AND c.dailyRate <= ?`;
            params.push(parseFloat(maxPrice));
        }

        // Features filter
        if (features) {
            const featuresList = Array.isArray(features) ? features : [features];
            // Using JSON_CONTAINS for each feature
            featuresList.forEach(feature => {
                query += ` AND JSON_CONTAINS(c.features, ?)`;
                params.push(JSON.stringify(feature));
            });
        }

        // Office filter
        if (officeId) {
            query += ` AND c.officeId = ?`;
            params.push(officeId);
        }

        query += ` ORDER BY c.model ASC`;

        const [cars] = await pool.execute(query, params);

        // Format the response to match the previous structure
        const formattedCars = cars.map(car => ({
            ...car,
            Office: {
                id: car.office_id,
                name: car.office_name,
                location: car.office_location
            }
        })).map(car => {
            delete car.office_id;
            delete car.office_name;
            delete car.office_location;
            return car;
        });

        res.json(formattedCars);
    } catch (error) {
        console.error('Error searching cars:', error);
        res.status(500).json({ message: 'Error searching cars' });
    }
});

// Get available features
router.get('/features', async (req, res) => {
    try {
        // List of common car features
        const commonFeatures = [
            'Air Conditioning',
            'Bluetooth',
            'Cruise Control',
            'Backup Camera',
            'Navigation System',
            'Leather Seats',
            'Sunroof',
            'Heated Seats',
            'Apple CarPlay',
            'Android Auto',
            'Parking Sensors',
            'Keyless Entry',
            'USB Ports',
            'Third Row Seating',
            'Roof Rack',
            'Towing Package'
        ];
        res.json(commonFeatures);
    } catch (error) {
        console.error('Error getting features:', error);
        res.status(500).json({ message: 'Error getting features' });
    }
});

module.exports = router;