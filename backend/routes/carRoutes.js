const express = require('express');
const router = express.Router();
const { Car, Office, Op } = require('../models/carModels');

router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching car details for id:', req.params.id);
        const car = await Car.findOne({
            where: { id: req.params.id },
            include: [{
                model: Office,
                attributes: ['id', 'name', 'location']
            }]
        });

        if (!car) {
            console.log('Car not found');
            return res.status(404).json({ message: 'Car not found' });
        }

        console.log('Car details found:', car);
        res.json(car);
    } catch (error) {
        console.error('Error fetching car details:', error);
        res.status(500).json({ message: 'Failed to fetch car details' });
    }
});

router.post('/', async (req, res) => {
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

        // Check if plate ID already exists
        const existingCar = await Car.findOne({ where: { plateId } });
        if (existingCar) {
            return res.status(400).json({ message: 'Car with this plate ID already exists' });
        }

        // Check if office exists
        const office = await Office.findByPk(officeId);
        if (!office) {
            return res.status(400).json({ message: 'Invalid office ID' });
        }

        const car = await Car.create({
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
        });

        res.status(201).json(car);
    } catch (error) {
        console.error('Error registering car:', error);
        res.status(400).json({ message: error.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const car = await Car.findByPk(id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        car.status = status;
        await car.save();

        res.json(car);
    } catch (error) {
        console.error('Error updating car status:', error);
        res.status(500).json({ message: 'Failed to update car status' });
    }
});

router.get('/', async (req, res) => {
    try {
        console.log('Fetching cars from database...');
        const cars = await Car.findAll({
            include: [{
                model: Office,
                attributes: ['id', 'name', 'location']
            }],
            order: [['id', 'ASC']]
        });

        res.json(cars);
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

        const where = {
            status: 'active' // Only show available cars
        };

        // Basic search term (searches in model and description)
        if (searchTerm) {
            where[Op.or] = [
                { model: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } }
            ];
        }

        // Category filter
        if (category) {
            where.category = category;
        }

        // Transmission filter
        if (transmission) {
            where.transmission = transmission;
        }

        // Fuel type filter
        if (fuelType) {
            where.fuelType = fuelType;
        }

        // Seating capacity range
        if (minSeats) {
            where.seatingCapacity = {
                ...where.seatingCapacity,
                [Op.gte]: parseInt(minSeats)
            };
        }
        if (maxSeats) {
            where.seatingCapacity = {
                ...where.seatingCapacity,
                [Op.lte]: parseInt(maxSeats)
            };
        }

        // Price range
        if (minPrice) {
            where.dailyRate = {
                ...where.dailyRate,
                [Op.gte]: parseFloat(minPrice)
            };
        }
        if (maxPrice) {
            where.dailyRate = {
                ...where.dailyRate,
                [Op.lte]: parseFloat(maxPrice)
            };
        }

        // Features filter (array of features)
        if (features) {
            const featuresList = Array.isArray(features) ? features : [features];
            where.features = {
                [Op.contains]: featuresList
            };
        }

        // Office filter
        if (officeId) {
            where.officeId = officeId;
        }

        const cars = await Car.findAll({
            where,
            include: [
                {
                    model: Office,
                    attributes: ['id', 'name', 'location']
                }
            ],
            order: [['model', 'ASC']]
        });

        res.json(cars);
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