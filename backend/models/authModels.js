const pool = require('../config/database');

const User = {
    async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM user WHERE username = ?', [username]);
        return rows[0];
    },
    
    async create(userData) {
        const { username, password, user_role = 'customer' } = userData;
        const [result] = await pool.query(
            'INSERT INTO user (username, password, user_role, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
            [username, password, user_role]
        );
        return { id: result.insertId, username, user_role, createdAt: result.createdAt, updatedAt: result.updatedAt };
    },
    
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = { User };