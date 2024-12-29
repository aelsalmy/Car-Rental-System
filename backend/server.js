require('dotenv').config();
const bodyParser = require('body-parser')
const express = require('express')
const loginRoutes = require('./routes/authRoutes.js')
const carRoutes = require('./routes/carRoutes.js')
const officeRoutes = require('./routes/officeRoutes.js')
const reservationRoutes = require('./routes/reservationRoutes.js')
const reportRoutes = require('./routes/reportRoutes.js')
const pool = require('./config/database')
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
app.use('/api/reports', reportRoutes)

console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Database connection established successfully');
        connection.release();
        
        // Start the server after confirming database connection
        app.listen(process.env.PORT, () => {
            console.log('Server Listening to port: ' + process.env.PORT)
        });
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    });