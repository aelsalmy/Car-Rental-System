const express = require('express');
const router = express.Router();
const { Car, Reservation, Office, Customer } = require('../models/carModels');
const { authenticateToken } = require('../middleware/auth');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

router.post('/', authenticateToken, async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { carId, startDate, endDate, paymentMethod, paymentStatus } = req.body;
        const userId = req.user.id;

        console.log('Creating reservation for user:', userId);

        // Get the customer ID associated with the user
        const customer = await Customer.findOne({
            where: { userId: userId }
        }, { transaction: t });

        console.log('Found customer:', customer ? customer.toJSON() : null);

        if (!customer) {
            await t.rollback();
            return res.status(404).json({ 
                message: 'Customer profile not found. Please ensure you have completed registration.',
                userId: userId
            });
        }

        const customerId = customer.id;

        // Log the values we'll use for the reservation
        console.log('Creating reservation with:', {
            carId,
            customerId,
            startDate,
            endDate,
            paymentMethod,
            paymentStatus
        });

        // Validate dates are not in the past
        const currentDate = new Date();
        if (new Date(startDate) < currentDate) {
            await t.rollback();
            return res.status(400).json({ message: 'Cannot make reservations for past dates' });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            await t.rollback();
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Check if car exists and is available
        const car = await Car.findOne({
            where: { id: carId, status: 'active' }
        }, { transaction: t });

        if (!car) {
            await t.rollback();
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
                    },
                    {
                        [Op.and]: [
                            { startDate: { [Op.lte]: startDate } },
                            { endDate: { [Op.gte]: endDate } }
                        ]
                    }
                ]
            }
        }, { transaction: t });

        if (overlapping) {
            await t.rollback();
            return res.status(400).json({ message: 'Car already reserved for these dates' });
        }

        // Calculate total cost
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalCost = days * car.dailyRate;

        // Create reservation
        const reservation = await Reservation.create({
            carId,
            customerId,
            startDate,
            endDate,
            status: 'pending',
            totalCost,
            paymentMethod,
            paymentStatus
        }, { transaction: t });

        console.log('Created reservation:', reservation.toJSON());

        await t.commit();

        res.status(201).json({
            message: 'Reservation created successfully',
            reservation: reservation
        });

    } catch (error) {
        await t.rollback();
        console.error('Error creating reservation:', error);
        res.status(500).json({
            message: 'Failed to create reservation',
            error: error.message,
            details: error.original ? error.original.sqlMessage : null
        });
    }
});

router.get('/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get the customer ID associated with the user
        const customer = await Customer.findOne({
            where: { userId: userId }
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customer.id;

        const reservations = await Reservation.findAll({
            where: { customerId: customerId },
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
        const userId = req.user.id;

        // Get the customer ID associated with the user
        const customer = await Customer.findOne({
            where: { userId: userId }
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customer.id;

        const reservation = await Reservation.findOne({
            where: {
                id: req.params.id,
                customerId: customerId
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

// Update reservation status endpoint
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const reservationId = req.params.id;

        // Only admin can update status
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Only admins can update reservation status' });
        }

        const reservation = await Reservation.findByPk(reservationId, {
            include: [Car]
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // If setting to active, check payment status for cash payments
        if (status === 'active' && reservation.paymentMethod === 'cash' && reservation.paymentStatus === 'unpaid') {
            return res.status(400).json({ 
                message: 'Cannot activate reservation - payment is pending for cash payment' 
            });
        }

        // Update reservation and car status
        await sequelize.transaction(async (t) => {
            await reservation.update({ status }, { transaction: t });
            
            // If activating reservation, update car status
            if (status === 'active') {
                await reservation.Car.update({ status: 'rented' }, { transaction: t });
            }
            // If completing or cancelling, check if car can be set back to active
            else if (status === 'completed' || status === 'cancelled') {
                await reservation.Car.update({ status: 'active' }, { transaction: t });
            }
        });

        res.json({ message: 'Reservation status updated successfully' });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ message: 'Error updating reservation status' });
    }
});

// Add new route to handle setting car to out of service by admin
router.patch('/car/:carId/status', authenticateToken, async (req, res) => {
    try {
        const { carId } = req.params;
        const { status } = req.body;

        // Check if user is admin (you may need to adjust this based on your auth system)
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Only admins can update car status' });
        }

        // Only allow setting to out_of_service
        if (status !== 'out_of_service') {
            return res.status(400).json({ message: 'Can only set cars to out of service status' });
        }

        // Check for active reservations
        const activeReservation = await Reservation.findOne({
            where: {
                carId,
                status: ['pending', 'active'],
                startDate: { [Op.lte]: new Date() },
                endDate: { [Op.gt]: new Date() }
            }
        });

        if (activeReservation) {
            return res.status(400).json({ 
                message: 'Cannot update car status - there is an active reservation until ' + 
                        new Date(activeReservation.endDate).toLocaleDateString() 
            });
        }

        // Update car status
        const car = await Car.findByPk(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        await car.update({ status: 'out_of_service' });
        res.json({ message: 'Car status updated to out of service' });
    } catch (error) {
        console.error('Error updating car status:', error);
        res.status(500).json({ message: 'Error updating car status' });
    }
});

module.exports = router;