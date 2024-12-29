const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
    try {
        console.log('Fetching offices from database...');
        const [offices] = await pool.execute(
            'SELECT * FROM offices ORDER BY name ASC'
        );
        console.log("Found offices:", offices);
        res.json(offices);
    } catch (error) {
        console.error('Error fetching offices:', error);
        res.status(500).json({ message: 'Failed to fetch offices' });
    }
});

module.exports = router; 