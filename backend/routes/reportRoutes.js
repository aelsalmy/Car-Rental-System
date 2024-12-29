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
        const { status, date } = req.query;
        
        const whereClause = {};
        const conditions = [];

        if (status) {
            conditions.push({ status: 'active' });
        }

        // Handle start date filtering
        if (date) {
            const start = new Date(date);
            const startDateStr = start.toISOString().split('T')[0];
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('startDate')),
                    '<=',
                    startDateStr
                )
            );
            conditions.push(
                Sequelize.where(
                    Sequelize.fn('DATE', Sequelize.col('endDate')),
                    '>=',
                    startDateStr
                )
            );
        }

        // Only add conditions if we have any
        if (conditions.length > 0) {
            whereClause[Op.and] = conditions;
        }
        
        let cars;

        if(status == 'rented'){
            cars = await Reservation.findAll({
            where: whereClause,
            include: [
                    {
                        model: Car,
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
                        attributes: ['id', 'name' , 'phone']
                    }
                ],
                attributes: ['carId' , 'customerId'],
                order: [['startDate', 'DESC']]
            });
        }
        else{
            if(status == 'out_of_service'){
                cars = await Car.findAll({
                    where: {status: status},
                    include: {
                        model: Office,
                        attributes: ['id', 'name', 'location']
                    },
                    attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
                });
            } else {
                if(status == 'active'){
                    const rented = await Reservation.findAll({
                    where: whereClause,
                    include: [
                            {
                                model: Car,
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
                                attributes: ['id', 'name' , 'phone']
                            }
                        ],
                        attributes: ['carId' , 'customerId'],
                        order: [['startDate', 'DESC']]
                    });

                    const rentedCarIds = rented.map((r) => r.carId);

                    cars = await Car.findAll({
                        where: {
                            status: {
                                [Op.not]: 'out_of_service',
                            },
                            id:{
                                [Op.notIn]: rentedCarIds
                            }
                        },
                        include: {
                            model: Office,
                            attributes: ['id', 'name', 'location']
                        },
                        attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
                    });
                }
            }
            if(!status){
                cars = await Car.findAll({
                    include: {
                        model: Office,
                        attributes: ['id', 'name', 'location']
                    },
                    attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
                });
            }
        }
        res.json(cars);
    } catch (error) {
        console.error('Error generating car reservation report:', error);
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

module.exports = router;