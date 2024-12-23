const express = require('express')
const { User } = require('../models/authModels')
const { Customer } = require('../models/carModels')
const bcrypt = require('bcrypt')
const loginRoutes = express.Router()
const jwt = require('jsonwebtoken')

loginRoutes.get('', async (req, res) => {
    res.send("TEST")
})

//Route to create a user
loginRoutes.post('/register', async (req, res) => {
    try {
        const { username, password , name ,  email , phone , address} = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({
            where: {
                username: username
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Username already exists'
            });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username: username,
            password: hashedPassword
        });

        await Customer.create({
            name: name,
            email: email,
            phone: phone,
            address: address,
            userId: newUser.id
        })

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error){
        console.log('Registration error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Username already exists'
            });
        }
        res.status(500).json({ message: 'Registration failed' });
    }
});



loginRoutes.post(['', '/login'], async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'Invalid Credentials' });
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user.id, username: user.username , role: user.user_role},
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('Generated token: ', token);
            return res.status(200).json({
                message: 'User Logged in Successfully',
                token: token,
                userId: user.id
            });
        } else {
            return res.status(404).json({ message: 'Invalid Credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed' });
    }
});

module.exports = loginRoutes