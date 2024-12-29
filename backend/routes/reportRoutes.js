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
        const carMap = new Map();

        if(status == 'rented'){
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

            rented.forEach((item) => {
                const carData = {
                    carId: item.Car?.id || null,
                    model: item.Car?.model || null,
                    year: item.Car?.year || null,
                    status: 'rented',
                    plateId: item.Car?.plateId || null,
                    officeName: item.Car?.Office?.name || null,
                    officeLocation: item.Car?.Office?.location || null,
                    customerName: item.Customer?.name || null,
                    customerPhone: item.Customer?.phone || null,
                    customerEmail: item.Customer?.email || null
                };
            
                if (carData.carId) {
                    carMap.set(carData.carId, carData);
                }
            });
        }
        else{
            if(status == 'out_of_service'){
                const outOfService = await Car.findAll({
                    where: {status: status},
                    include: {
                        model: Office,
                        attributes: ['id', 'name', 'location']
                    },
                    attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
                });

                outOfService.forEach((item) => {
                    const carData = {
                        carId: item.id || null,
                        model: item.model || null,
                        year: item.year || null,
                        status: 'out_of_service',
                        plateId: item.plateId || null,
                        officeName: item.Office?.name || null,
                        officeLocation: item.Office?.location || null,
                        customerName: null, 
                        customerPhone: null,
                        customerEmail: null
                    };
                
                    if (carData.carId && !carMap.has(carData.carId)) {
                        carMap.set(carData.carId, carData);
                    }
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

                    const active = await Car.findAll({
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

                    active.forEach((item) => {
                        const carData = {
                            carId: item.id || null,
                            model: item.model || null,
                            year: item.year || null,
                            status: 'active',
                            plateId: item.plateId || null,
                            officeName: item.Office?.name || null,
                            officeLocation: item.Office?.location || null,
                            customerName: null, 
                            customerPhone: null,
                            customerEmail: null
                        };
                    
                        if (carData.carId && !carMap.has(carData.carId)) {
                            carMap.set(carData.carId, carData);
                        }
                    });
                }
            }
            if(!status){
                const rented = await Reservation.findAll({
                    where: whereClause,
                    include: [
                            {
                            where: {status: 'active'},
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

                const others = await Car.findAll({
                    include: {
                        model: Office,
                        attributes: ['id', 'name', 'location']
                    },
                    attributes: ['id', 'model', 'year', 'plateId', 'status', 'dailyRate', 'category']
                });

                rented.forEach((item) => {
                    const carData = {
                        carId: item.Car?.id || null,
                        model: item.Car?.model || null,
                        year: item.Car?.year || null,
                        status: 'rented',
                        plateId: item.Car?.plateId || null,
                        officeName: item.Car?.Office?.name || null,
                        officeLocation: item.Car?.Office?.location || null,
                        customerName: item.Customer?.name || null,
                        customerPhone: item.Customer?.phone || null,
                        customerEmail: item.Customer?.email || null
                    };
                
                    if (carData.carId) {
                        carMap.set(carData.carId, carData);
                    }
                });
                
                others.forEach((item) => {
                    const carData = {
                        carId: item.id || null,
                        model: item.model || null,
                        year: item.year || null,
                        status: item.status == 'out_of_service'?'out_of_service':'active',
                        plateId: item.plateId || null,
                        officeName: item.Office?.name || null,
                        officeLocation: item.Office?.location || null,
                        customerName: null, 
                        customerPhone: null,
                        customerEmail: null
                    };
                
                    if (carData.carId && !carMap.has(carData.carId)) {
                        carMap.set(carData.carId, carData);
                    }
                });
                
                
            }
        }
        cars = Array.from(carMap.values()); 

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