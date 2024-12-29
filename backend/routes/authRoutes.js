const express = require('express')
const bcrypt = require('bcrypt')
const loginRoutes = express.Router()
const jwt = require('jsonwebtoken')
const pool = require('../config/database');

loginRoutes.get('', async (req, res) => {
    res.send("TEST")
})

//Route to create a user
loginRoutes.post('/register', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        console.log('Received registration data:', req.body);
        const { username, password, customerInfo } = req.body;
        
        if (!customerInfo || !customerInfo.name || !customerInfo.email) {
            return res.status(400).json({
                message: 'Customer information is required'
            });
        }

        const { name, email, phone, address } = customerInfo;

        await connection.beginTransaction();

        // Check if username already exists
        const [existingUser] = await connection.execute(
            'SELECT id FROM user WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: 'Username already exists'
            });
        }

        // Check if email already exists
        const [existingCustomer] = await connection.execute(
            'SELECT id FROM customers WHERE email = ?',
            [email]
        );

        if (existingCustomer.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const [userResult] = await connection.execute(
                'INSERT INTO user (username, password, user_role) VALUES (?, ?, ?)',
                [username, hashedPassword, 'user']
            );

            const userId = userResult.insertId;

            try {
                await connection.execute(
                    'INSERT INTO customers (name, email, phone, address, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                    [name, email, phone, address, userId]
                );

                await connection.commit();
                res.status(201).json({ 
                    message: 'User registered successfully',
                    userId: userId
                });
            } catch (error) {
                console.error('Customer creation error:', error);
                await connection.rollback();
                throw error;
            }
        } catch (error) {
            console.log('Registration error:', error);
            await connection.rollback();
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: 'Username or email already exists'
                });
            }
            res.status(500).json({ 
                message: 'Registration failed',
                error: error.message,
                details: error.sqlMessage
            });
        }
    } catch (error){
        console.log('Registration error:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Registration failed: ' + error });
    } finally {
        connection.release();
    }
});

loginRoutes.post(['', '/login'], async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
        const [users] = await pool.execute(
            'SELECT * FROM user WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            console.log('User not found');
            return res.status(404).json({ message: 'Invalid Credentials' });
        }

        const user = users[0];

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.user_role },
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