const express = require('express');
const router = express.Router();
const { Car, Reservation, Office, Customer, Payment } = require('../models/carModels');
const { authenticateToken , authenticateAdmin} = require('../middleware/auth');
const sequelize = require('../config/database');
const { Op, Sequelize } = require('sequelize');

// Get car reservation report
router.get('/car', authenticateAdmin, async (req, res) => {
    try {
        const { carId, startDate, endDate } = req.query;
        
        const whereClause = {};
        const conditions = [];

        // Always filter by car ID
        if (carId) {
            conditions.push({ carId: carId });
        }

        // Handle start date filtering
        if (startDate) {
            const start = new Date(startDate);
            const startDateStr = start.toISOString().split('T')[0];
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('startDate')),
                    '=',
                    startDateStr
                )
            );
        }

        // Handle end date filtering
        if (endDate) {
            const end = new Date(endDate);
            const endDateStr = end.toISOString().split('T')[0];
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('endDate')),
                    '=',
                    endDateStr
                )
            );
        }

        // Only add conditions if we have any
        if (conditions.length > 0) {
            whereClause[Op.and] = conditions;
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: Car,
                    include: [
                        {
                            model: Office,
                            attributes: ['id', 'name', 'location', 'phone']
                        }
                    ],
                    attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category', 'transmission', 'fuelType']
                },
                {
                    model: Customer,
                    attributes: ['id', 'name', 'email', 'phone', 'address']
                },
                {
                    model: Payment,
                    attributes: ['id', 'amount', 'paymentMethod', 'paymentStatus']
                }
            ],
            attributes: ['id', 'carId', 'customerId', 'startDate', 'endDate', 'status', 'createdAt', 'updatedAt'],
            order: [['startDate', 'DESC']]
        });

        res.json(reservations);
    } catch (error) {
        console.error('Error generating car reservation report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
});

// Get detailed reservation report
router.get('/reservation', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const whereClause = {};
        const conditions = [];

        // Handle start date filtering
        if (startDate) {
            const start = new Date(startDate);
            const startDateStr = start.toISOString().split('T')[0];
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('startDate')),
                    '=',
                    startDateStr
                )
            );
        }

        // Handle end date filtering
        if (endDate) {
            const end = new Date(endDate);
            const endDateStr = end.toISOString().split('T')[0];
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('endDate')),
                    '=',
                    endDateStr
                )
            );
        }

        // Only add conditions if we have any
        if (conditions.length > 0) {
            whereClause[Op.and] = conditions;
        }

        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [
                {
                    model: Car,
                    include: [
                        {
                            model: Office,
                            attributes: ['id', 'name', 'location', 'phone']
                        }
                    ],
                    attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category', 'transmission', 'fuelType']
                },
                {
                    model: Customer,
                    attributes: ['id', 'name', 'email', 'phone', 'address']
                },
                {
                    model: Payment,
                    attributes: ['id', 'amount', 'paymentMethod', 'paymentStatus']
                }
            ],
            attributes: ['id', 'carId', 'customerId', 'startDate', 'endDate', 'status', 'createdAt', 'updatedAt'],
            order: [['startDate', 'DESC']]
        });

        res.json(reservations);
    } catch (error) {
        console.error('Error generating reservation report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
});

router.get('/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        
        let cars;

        if(status === 'rented'){
            // For rented cars, get current active reservations with customer info
            cars = await Reservation.findAll({
                where: {
                    status: 'active'  // Only get active reservations
                },
                include: [
                    {
                        model: Car,
                        where: { status: 'rented' },  // Only get rented cars
                        include: [
                            {
                                model: Office,
                                attributes: ['id', 'name', 'location']
                            }
                        ],
                        attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
                    },
                    {
                        model: Customer,
                        attributes: ['id', 'name', 'phone', 'email']
                    }
                ],
                attributes: ['id', 'carId', 'customerId', 'startDate', 'endDate']
            });
        } else if(status === 'out_of_service') {
            // For out of service cars
            cars = await Car.findAll({
                where: { status: 'out_of_service' },
                include: [
                    {
                        model: Office,
                        attributes: ['id', 'name', 'location']
                    }
                ],
                attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
            });
        } else if(status === 'active') {
            // For active cars, get cars that are not in any active reservation
            const activeReservations = await Reservation.findAll({
                where: { status: 'active' },
                attributes: ['carId']
            });
            
            const rentedCarIds = activeReservations.map(r => r.carId);
            
            cars = await Car.findAll({
                where: {
                    status: 'active',
                    id: {
                        [Op.notIn]: rentedCarIds
                    }
                },
                include: [
                    {
                        model: Office,
                        attributes: ['id', 'name', 'location']
                    }
                ],
                attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
            });
        } else {
            // If no status specified, get all cars
            cars = await Car.findAll({
                include: [
                    {
                        model: Office,
                        attributes: ['id', 'name', 'location']
                    }
                ],
                attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
            });
        }

        console.log('Status Report Response:', JSON.stringify(cars, null, 2));
        res.json(cars);
    } catch (error) {
        console.error('Error generating car status report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
});

router.get('/customer' , authenticateAdmin , async (req , res) => {
    try {
        const { customerId } = req.query;

        let customerReservations;

        if(customerId){
            customerReservations = await Reservation.findAll({
                where:{
                    customerId: customerId
                },
                include: [
                    {
                        model: Car,
                        include: [
                            {
                                model: Office,
                                attributes: ['id', 'name', 'location', 'phone']
                            }
                        ],
                        attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category', 'transmission', 'fuelType']
                    },
                    {
                        model: Customer,
                        attributes: ['id', 'name', 'email', 'phone', 'address']
                    },
                    {
                        model: Payment,
                        attributes: ['id', 'amount', 'paymentMethod', 'paymentStatus']
                    }
                ]
            });
        }
        else {
            customerReservations = await Reservation.findAll({
                include: [
                    {
                        model: Car,
                        include: [
                            {
                                model: Office,
                                attributes: ['id', 'name', 'location', 'phone']
                            }
                        ],
                        attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category', 'transmission', 'fuelType']
                    },
                    {
                        model: Customer,
                        attributes: ['id', 'name', 'email', 'phone', 'address']
                    },
                    {
                        model: Payment,
                        attributes: ['id', 'amount', 'paymentMethod', 'paymentStatus']
                    }
                ]
            });
        }
        
        res.json(customerReservations);
    } catch (error) {
        console.error('Error generating car reservation report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
});

router.get('/payment' , authenticateAdmin , async (req,res) => {
    try {
        const { startDate , endDate } = req.query;

        let payments;

        const whereClause = {};
        const conditions = [];

        // Handle start date filtering
        if (startDate) {
            const start = new Date(startDate);
            const startDateStr = start.toISOString().split('T')[0];
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('Payment.updatedAt')),
                    '>=',
                    startDateStr
                )
            );
        }

        // Handle end date filtering
        if (endDate) {
            const end = new Date(endDate);
            const endDateStr = end.toISOString().split('T')[0];
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('Payment.updatedAt')),
                    '<=',
                    endDateStr
                )
            );
        }

        conditions.push({ paymentStatus: 'paid' });

        // Only add conditions if we have any
        if (conditions.length > 0) {
            whereClause[Op.and] = conditions;
        }

        payments = await Payment.findAll({
            where: whereClause,
            include: [
                {
                    model: Reservation,
                    include:[
                        {
                            model: Car,
                            include:[
                                {
                                    model: Office,
                                    attributes:['name' , 'location']
                                }
                            ],
                            attributes: ['model' , 'year' , 'plateId']
                        },
                        {
                            model: Customer,
                            attributes: ['name' , 'phone' , 'email']
                        }
                    ],
                    attributes: ['id']
                }
            ],
        })
        res.json(payments);
    } catch (error) {
        console.error('Error generating payment report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
});

module.exports = router;