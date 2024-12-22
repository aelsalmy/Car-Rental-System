const express = require('express');
const router = express.Router();
const { Car, Reservation, Office } = require('../models/carModels');
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../config/database');

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { carId, startDate, endDate } = req.body;
        const customerId = req.user.id;

        // Check if car exists and is available
        const car = await Car.findOne({
            where: { id: carId, status: 'active' }
        });

        if (!car) {
            return res.status(404).json({ message: 'Car not available' });
        }

        // Check for overlapping reservations
        const overlapping = await Reservation.findOne({
            where: {
                carId,
                status: ['pending', 'active'],
                [Op.or]: [
                    {
                        startDate: { [Op.between]: [startDate, endDate] }
                    },
                    {
                        endDate: { [Op.between]: [startDate, endDate] }
                    }
                ]
            }
        });

        if (overlapping) {
            return res.status(400).json({ message: 'Car already reserved for these dates' });
        }

        // Calculate total cost
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalCost = days * car.dailyRate;

        // Create reservation and update car status in a transaction
        const result = await sequelize.transaction(async (t) => {
            const reservation = await Reservation.create({
                carId,
                customerId,
                startDate,
                endDate,
                totalCost,
                status: 'rented'
            }, { transaction: t });

            // Update car status
            await car.update({ status: 'rented' }, { transaction: t });

            return reservation;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Error creating reservation' });
    }
});

router.get('/my', authenticateToken, async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            where: { customerId: req.user.id },
            include: [
                {
                    model: Car,
                    include: [Office]
                }
            ]
        });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Failed to fetch reservations' });
    }
});

router.patch('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const reservation = await Reservation.findOne({
            where: {
                id: req.params.id,
                customerId: req.user.id
            }
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (reservation.status !== 'pending' && reservation.status !== 'active') {
            return res.status(400).json({ message: 'Cannot cancel this reservation' });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        res.json(reservation);
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ message: 'Failed to cancel reservation' });
    }
});

router.get('/test-auth', authenticateToken, (req, res) => {
    res.json({
        message: 'Authentication successful',
        user: req.user
    });
});

module.exports = router; 