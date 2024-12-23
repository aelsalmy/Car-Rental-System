require('dotenv').config();
const bodyParser = require('body-parser')
const express = require('express')
const loginRoutes = require('./routes/authRoutes.js')
const carRoutes = require('./routes/carRoutes.js')
const officeRoutes = require('./routes/officeRoutes.js')
const reservationRoutes = require('./routes/reservationRoutes.js')
const sequelize = require('./config/database')
const cors = require('cors')

const app = express()

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json())
app.use('/api/auth', loginRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/offices', officeRoutes)
app.use('/api/reservations', reservationRoutes)


console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

sequelize.sync({ alter: true, logging: false })
    .then(() => {
        console.log('Database Synced Successfully')
        app.listen(process.env.PORT, () => {
            console.log('Server Listening to port: ' + process.env.PORT)
        })
    })
    .catch((err) => {
        console.log('Error: Database Syncing Failed ' + err)
    });