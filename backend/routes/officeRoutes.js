const express = require('express');
const router = express.Router();
const { Office } = require('../models/carModels');

router.get('/', async (req, res) => {
    try {
        console.log('Fetching offices from database...');
        const offices = await Office.findAll({
            order: [['name', 'ASC']]
        });
        console.log("Found offices:" + offices)
        res.json(offices);
    } catch (error) {
        console.error('Error fetching offices:', error);
        res.status(500).json({ message: 'Failed to fetch offices' });
    }
});

module.exports = router; 