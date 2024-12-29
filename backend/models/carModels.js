const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { User } = require('./authModels');

const Car = sequelize.define('Car', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    plateId: { type: DataTypes.STRING, allowNull: false, unique: 'plateId' },
    status: { 
        type: DataTypes.ENUM('active', 'out_of_service', 'rented'), 
        defaultValue: 'active',
        index: false 
    },
    officeId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        index: true 
    },
    dailyRate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: { 
        type: DataTypes.ENUM(
            'sedan', 
            'suv', 
            'sports', 
            'luxury', 
            'compact', 
            'van', 
            'pickup'
        ), 
        allowNull: false,
        index: false 
    },
    transmission: { 
        type: DataTypes.ENUM('automatic', 'manual'), 
        allowNull: false,
        index: false 
    },
    fuelType: { 
        type: DataTypes.ENUM(
            'gasoline', 
            'diesel', 
            'hybrid', 
            'electric'
        ), 
        allowNull: false,
        index: false 
    },
    seatingCapacity: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: 2,
            max: 15
        },
        index: false 
    },
    features: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
    },
    description: { 
        type: DataTypes.TEXT,
        allowNull: true 
    }
});

const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: 'email', allowNull: false },
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
    carId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        index: true 
    },
    customerId: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        index: true 
    },
    startDate: { 
        type: DataTypes.DATE, 
        allowNull: false,
        validate: {
            isNotPast(value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(value);
                startDate.setHours(0, 0, 0, 0);
                
                if (startDate < today) {
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
                const startDate = new Date(this.startDate);
                const endDate = new Date(value);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                
                if (endDate <= startDate) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    status: { 
        type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'), 
        defaultValue: 'pending',
        index: false 
    }
}, {
    hooks: {
        beforeCreate: async (reservation) => {
            const car = await Car.findByPk(reservation.carId);
            if (!car || car.status !== 'active') {
                throw new Error('Car is not available for reservation');
            }
        },
        beforeUpdate: async (reservation) => {
            if (reservation.status === 'active') {
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
    paymentMethod: { type: DataTypes.ENUM('cash', 'credit_card'), allowNull: false },
    paymentStatus: { type: DataTypes.ENUM('paid', 'unpaid'), allowNull: false, defaultValue: 'unpaid' }
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