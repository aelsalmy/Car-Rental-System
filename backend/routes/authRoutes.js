const express = require('express')
const { User } = require('../models/authModels')
const bcrypt = require('bcrypt')
const loginRoutes = express.Router()
const jwt = require('jsonwebtoken')

loginRoutes.get('' , async (req , res) => {
    res.send("TEST")
})

//Route to create a user
loginRoutes.post('/register', async (req, res) => {
    
    const {username , password} = req.body

    try{
        const hashed_pass = await bcrypt.hash(password , 10)
        const user = await User.create({username , password: hashed_pass})
        return res.status(201).json({message: 'User Created Successfully'})
    }
    catch(error){
        return res.status(501).json({message: 'User Creation Failed Error: '  + error })
    }   
});


//Route for login
loginRoutes.post('' , async (req, res) => {
    const {username , password} = req.body

    try{
        const user = await User.findOne({where: {username}})
        if(!user)
            return res.status(404).send('Invalid Credentials')
        else{
            if(await bcrypt.compare(password , user.password)){
                return res.status(201).json({message: 'User Logged in Successfully'})
            }
            else{
                return res.status(404).send('Invalid Credentials')
            }
        }
    }
    catch(error){
        return res.status(501).json({message: 'User Creation Failed Error: '  + error })
    }  
})

module.exports = loginRoutes