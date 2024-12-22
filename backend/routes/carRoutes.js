const express = require('express');
const router = express.Router();
const { Car, Office } = require('../models/carModels');

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
        const { model, year, plateId, status, officeId, dailyRate, specifications } = req.body;

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
            specifications
        });

        res.status(201).json(car);
    } catch (error) {
        console.error('Error registering car:', error);
        res.status(500).json({ message: 'Failed to register car' });
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
        console.log(`Found ${cars.length} cars:`, JSON.stringify(cars, null, 2));
        res.json(cars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ message: 'Failed to fetch cars' });
    }
});

router.get('/offices', async (req, res) => {
    try {
        const offices = await Office.findAll({
            order: [['name', 'ASC']]
        });
        res.json(offices);
    } catch (error) {
        console.error('Error fetching offices:', error);
        res.status(500).json({ message: 'Failed to fetch offices' });
    }
});

module.exports = router; 