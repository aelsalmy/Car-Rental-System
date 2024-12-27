const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    console.log("headers:  " + req.headers)

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth Header:', authHeader);
    console.log('Extracted Token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.log('Decoded user:', user);
        req.user = user;
        next();
    });
};

const authenticateAdmin = (req, res, next) => {
    console.log("headers:  " + req.headers)

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth Header:', authHeader);
    console.log('Extracted Token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        if(user.role !== "admin"){
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        else{
            console.log('Decoded user:', user);
            req.user = user;
            next();
        }
    });
};

module.exports = { authenticateToken , authenticateAdmin}; 