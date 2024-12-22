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
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'), defaultValue: 'pending' },
    totalCost: { type: DataTypes.DECIMAL(10, 2) }
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

Reservation.belongsTo(Customer, { foreignKey: 'customerId' });

Payment.belongsTo(Reservation, { foreignKey: 'reservationId' });

module.exports = {
    Car,
    Customer,
    Office,
    Reservation,
    Payment
}; 