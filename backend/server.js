const bodyParser = require('body-parser')
const express = require('express')
const loginRoutes = require('./routes/authRoutes.js')
const { sequelize } = require('./models/authModels.js')
const cors = require('cors')


const app = express()

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json())

app.use('/login' , loginRoutes)

sequelize.sync({alter: true , logging: false}).then( ()=>{
        console.log('Database Synced Successfully')
    })
    .catch((err) => {
        console.log('Error: Database Syncing Failed ' + err)
    }
)
    
app.listen(process.env.PORT , () =>{
        console.log('Server Listening to port: ' + process.env.PORT)
    }
)