const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notNull: { msg: 'Username is required' },
            notEmpty: { msg: 'Username cannot be empty' }
        }
    },
    password: { type: DataTypes.STRING(255), allowNull: false },
    user_role: { 
        type: DataTypes.ENUM('user', 'admin', 'customer'), 
        defaultValue: 'customer' 
    },
},
    {
        tablename: 'user',
        timestamps: false,
        freezeTableName: true,
        indexes: [{ unique: true, fields: ['username'] }]
    });

module.exports = { User };