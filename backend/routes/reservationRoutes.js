const express = require('express');
const router = express.Router();
const { Car, Reservation, Office, Customer } = require('../models/carModels');
const { authenticateToken , authenticateAdmin} = require('../middleware/auth');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

router.post('/', authenticateToken, async (req, res) => {           //route to insert a reservation
    try {
        const { carId, startDate, endDate } = req.body;
        const userid = req.user.id;

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

        const customer = await Customer.findOne({
            where: { userId: userid }
        });

        if (overlapping) {
            return res.status(400).json({ message: 'Car already reserved for these dates' });
        }

        // Calculate total cost
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalCost = days * car.dailyRate;

        const customerId = customer.id;
                
        // Create reservation and update car status in a transaction
        const result = await sequelize.transaction(async (t) => {
            const reservation = await Reservation.create({
                carId,
                customerId,
                startDate,
                endDate,
                totalCost,
                status: 'pending'
            }, { transaction: t });

            // Update car status
            await car.update({ status: 'rented' }, { transaction: t });

            return reservation;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Error creating reservation: ' + error});
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

router.delete('/:id/delete', authenticateToken, async (req, res) => {
    try {
        await Reservation.destroy({
            where: {
                id: req.params.id,
                customerId: req.user.id
            }
        })

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.json(reservation);
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Failed to delete reservation' + error});
    }
});

router.get('/getAll' , authenticateAdmin , async (req , res) => {
    try{
        const reservations = await Reservation.findAll({
            include: [
                {
                    model: Customer,
                },
                {
                    model: Car,
                    attributes: ['model' , 'year']
                }
            ]   
        });
        res.json(reservations);
    }
    catch(err){
        res.status(500).json({ message: 'Failed to get All reservations: ' + err });
    }
});

router.get('/test-auth', authenticateToken, (req, res) => {
    res.json({
        message: 'Authentication successful',
        user: req.user
    });
});

module.exports = router; 