const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { User } = require('./authModels');

const Car = sequelize.define('Car', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    plateId: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('active', 'out_of_service', 'rented'), defaultValue: 'active' },
    officeId: { type: DataTypes.INTEGER, allowNull: false },
    dailyRate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    specifications: { type: DataTypes.TEXT }
});

const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    userId: { type: DataTypes.INTEGER, allowNull: false }
});

const Office = sequelize.define('Office', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING }
});

const Reservation = sequelize.define('Reservation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    carId: { type: DataTypes.INTEGER, allowNull: false },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    startDate: { 
        type: DataTypes.DATE, 
        allowNull: false,
        validate: {
            isNotPast(value) {
                if (new Date(value) < new Date()) {
                    throw new Error('Cannot make reservations for past dates');
                }
            }
        }
    },
    endDate: { 
        type: DataTypes.DATE, 
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                if (new Date(value) <= new Date(this.startDate)) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    status: { 
        type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'), 
        defaultValue: 'pending'
    },
    paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'paid'),
        defaultValue: 'unpaid'
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'credit_card'),
        allowNull: true
    },
    totalCost: { type: DataTypes.DECIMAL(10, 2) }
}, {
    hooks: {
        beforeCreate: async (reservation) => {
            if (new Date(reservation.startDate) < new Date()) {
                throw new Error('Cannot create reservations in the past');
            }
        },
        beforeUpdate: async (reservation) => {
            if (reservation.changed('status') && reservation.status === 'active') {
                const car = await Car.findByPk(reservation.carId);
                if (car && car.status !== 'active') {
                    throw new Error('Cannot activate reservation - car is not available');
                }
            }
        }
    }
});

const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reservationId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    paymentMethod: { type: DataTypes.STRING }
});

Car.belongsTo(Office, { foreignKey: 'officeId' });
Office.hasMany(Car, { foreignKey: 'officeId' });

Car.hasMany(Reservation, { foreignKey: 'carId' });
Reservation.belongsTo(Car, { foreignKey: 'carId' });

Customer.hasMany(Reservation, { foreignKey: 'customerId' });
User.belongsTo(Customer , {foreignKey: 'userId'})

Reservation.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Customer, { foreignKey: 'userId' });

Reservation.hasOne(Payment, { foreignKey: 'reservationId' });
Payment.belongsTo(Reservation, { foreignKey: 'reservationId' });

module.exports = {
    Car,
    Customer,
    Office,
    Reservation,
    Payment
};