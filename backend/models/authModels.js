const {Sequelize , DataTypes} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME , process.env.DB_USER , process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: 3307,
        dialect: 'mysql'
    }
)

const User = sequelize.define('User',{
        id: {type: DataTypes.INTEGER , allowNull: false , autoIncrement: true , primaryKey: true},
        username: {type: DataTypes.STRING(255)},
        password: {type: DataTypes.STRING(255)}
    },
    {
        tablename: 'user',
        timestamps: false,
        freezeTableName: true
    }
)

module.exports = {sequelize , User}