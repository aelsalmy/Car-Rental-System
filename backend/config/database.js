const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    alter: true,
    port: 3306,
    dialect: 'mysql',
    define: {
        // Disable automatic index creation for all foreign keys
        indexes: [],
        // Only create indexes that we explicitly define
        timestamps: true
    },
    logging: false, // Disable logging to reduce noise
})

module.exports = sequelize;