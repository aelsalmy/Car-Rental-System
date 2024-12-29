const express = require('express');
const router = express.Router();
const { Car, Reservation, Office, Customer, Payment } = require('../models/carModels');
const { authenticateToken , authenticateAdmin} = require('../middleware/auth');
const sequelize = require('../config/database');
const { Op, Sequelize } = require('sequelize');

router.post('/', authenticateToken, async (req, res) => {           //route to insert a reservation
    try {
        const { carId, startDate, endDate, paymentMethod, paymentStatus, totalCost } = req.body;
        const userid = req.user.id;

        // Check if car exists and is available
        const car = await Car.findOne({
            where: { id: carId }
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
            return res.status(400).json({ 
                message: `This car is already reserved for these dates. Please end your reservation before ${new Date(overlapping.startDate).toLocaleDateString()}` 
            });
        }

        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customer.id;
                
        // Create reservation and payment record in a transaction
        const result = await sequelize.transaction(async (t) => {
            // Create the reservation

            const reservation = await Reservation.create({
                carId,
                customerId,
                startDate,
                endDate,
                status: 'pending',
                totalCost
            }, { transaction: t });

            // Create the payment record
            await Payment.create({
                reservationId: reservation.id,
                amount: totalCost,
                paymentMethod,
                paymentStatus
            }, { transaction: t });
            console.log('Finished Transaction');
            return reservation;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Error creating reservation: ' + error.message });
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
                },
                {
                    model: Payment,
                    attributes: ['amount', 'paymentMethod', 'paymentStatus']
                }
            ],
            order: [['createdAt', 'DESC']]
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

router.get('/getAll', authenticateAdmin, async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            include: [
                {
                    model: Car,
                    include: [Office]
                },
                {
                    model: Customer,
                    attributes: ['name', 'email', 'phone', 'address']
                },
                {
                    model: Payment,
                    attributes: ['amount', 'paymentMethod', 'paymentStatus']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching all reservations:', error);
        res.status(500).json({ message: 'Failed to fetch reservations' });
    }
});

// Update reservation status endpoint
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const reservationId = req.params.id;

        const reservation = await Reservation.findByPk(reservationId, {
            include: [Car, Payment]
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reservationStart = new Date(reservation.startDate);
        reservationStart.setHours(0, 0, 0, 0);

        // Update reservation and car status
        await sequelize.transaction(async (t) => {
            await reservation.update({ status }, { transaction: t });
            
            // If activating reservation, only update car status if today is the start date
            if (status === 'active') {
                // Update payment status to paid for cash payments
                if (reservation.Payment.paymentMethod === 'cash') {
                    await Payment.update(
                        { paymentStatus: 'paid' },
                        { 
                            where: { reservationId: reservation.id },
                            transaction: t 
                        }
                    );
                }

                // Only set car to rented if today is the start date or after
                if (today >= reservationStart) {
                    await Car.update(
                        { status: 'rented' },
                        { 
                            where: { id: reservation.carId },
                            transaction: t 
                        }
                    );
                }
            }
            // If completing or cancelling, set car back to active
            else if (status === 'completed' || status === 'cancelled') {
                await Car.update(
                    { status: 'active' },
                    { 
                        where: { id: reservation.carId },
                        transaction: t 
                    }
                );
            }
        });

        res.json({ message: 'Reservation status updated successfully' });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ message: 'Error updating reservation status' });
    }
});

// Add new route to handle setting car to out of service by admin
router.patch('/car/:carId/status', authenticateAdmin, async (req, res) => {
    try {
        const { carId } = req.params;
        const { status } = req.body;

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

// Search reservations endpoint
router.get('/search', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate, status, currentlyRented } = req.query;
        
        // Build where clause
        const whereClause = {};
        
        if (currentlyRented === 'true') {
            const currentDate = new Date().toISOString().split('T')[0];
            
            // First, find all cars that are currently rented
            const currentlyRentedCars = await Reservation.findAll({
                where: {
                    startDate: { [Op.lte]: currentDate },
                    endDate: { [Op.gte]: currentDate },
                    status: 'active'
                },
                attributes: ['carId'],
                raw: true
            });
            
            // Get all car IDs (including duplicates)
            const carIds = currentlyRentedCars.map(r => r.carId);
            
            // Now get all reservations for these cars
            whereClause.carId = { [Op.in]: carIds };
        } else {
            // Regular search filters
            if (startDate && endDate) {
                whereClause.startDate = startDate;
                whereClause.endDate = endDate;
            } else if (startDate) {
                whereClause.startDate = startDate;
            } else if (endDate) {
                whereClause.endDate = endDate;
            }
            
            if (status) {
                whereClause.status = status;
            }
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: Car,
                    include: [Office]
                },
                {
                    model: Customer,
                    attributes: ['name', 'email', 'phone', 'address']
                },
                {
                    model: Payment,
                    attributes: ['amount', 'paymentMethod', 'paymentStatus']
                }
            ],
            order: [['startDate', 'DESC']]
        });

        res.json(reservations);
    } catch (error) {
        console.error('Error searching reservations:', error);
        res.status(500).json({ message: 'Failed to search reservations' });
    }
});

router.get('/customers', authenticateAdmin, async (req, res) => {
    try {
        const customers = await Customer.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(customers);
    } catch (error) {
        console.error('Error fetching all customers:', error);
        res.status(500).json({ message: 'Failed to fetch customers' });
    }
});

module.exports = router;