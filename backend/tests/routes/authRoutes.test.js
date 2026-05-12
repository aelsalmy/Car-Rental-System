jest.mock('../../config/database', () => {
    const { createPoolMock } = require('../helpers/dbMock');
    const instance = createPoolMock();
    global.__mockDb = instance;
    return instance.pool;
});

require('../../config/database');
const dbMock = global.__mockDb;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('supertest');

const authRoutes = require('../../routes/authRoutes');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    return app;
}

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    console.log.mockRestore && console.log.mockRestore();
    console.error.mockRestore && console.error.mockRestore();
});

beforeEach(() => {
    dbMock.reset();
});

describe('POST /api/auth/register', () => {
    test('returns 400 when customer information is missing', async () => {
        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'alice', password: 'secret' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/customer information/i);
        expect(dbMock.connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('returns 409 when username already exists', async () => {
        dbMock.enqueue([[{ id: 1 }]]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'alice',
                password: 'secret',
                customerInfo: { name: 'Alice', email: 'alice@example.com', phone: '111', address: 'X' },
            });

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/username/i);
        expect(dbMock.connection.rollback).toHaveBeenCalled();
        expect(dbMock.connection.commit).not.toHaveBeenCalled();
    });

    test('returns 409 when email already exists', async () => {
        dbMock.enqueue([[]]);
        dbMock.enqueue([[{ id: 7 }]]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'bob',
                password: 'secret',
                customerInfo: { name: 'Bob', email: 'bob@example.com', phone: '222', address: 'Y' },
            });

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/email/i);
        expect(dbMock.connection.rollback).toHaveBeenCalled();
    });

    test('creates user and customer in a single transaction and hashes password', async () => {
        dbMock.enqueue([[]]);
        dbMock.enqueue([[]]);
        dbMock.enqueue([{ insertId: 123 }]);
        dbMock.enqueue([{}]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'carol',
                password: 'plaintext-pw',
                customerInfo: { name: 'Carol', email: 'carol@example.com', phone: '333', address: 'Z' },
            });

        expect(res.status).toBe(201);
        expect(res.body.userId).toBe(123);
        expect(dbMock.connection.beginTransaction).toHaveBeenCalled();
        expect(dbMock.connection.commit).toHaveBeenCalled();
        expect(dbMock.connection.rollback).not.toHaveBeenCalled();

        const insertCall = dbMock.connection.execute.mock.calls.find(
            ([sql]) => /INSERT INTO user/i.test(sql)
        );
        expect(insertCall).toBeDefined();
        const storedPassword = insertCall[1][1];
        expect(storedPassword).not.toBe('plaintext-pw');
        expect(await bcrypt.compare('plaintext-pw', storedPassword)).toBe(true);
    });

    test('returns 409 when DB raises ER_DUP_ENTRY on customer insert', async () => {
        dbMock.enqueue([[]]);
        dbMock.enqueue([[]]);
        dbMock.enqueue([{ insertId: 1 }]);
        const dup = new Error('Duplicate entry');
        dup.code = 'ER_DUP_ENTRY';
        dbMock.enqueue(dup);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'dave',
                password: 'secret',
                customerInfo: { name: 'Dave', email: 'dave@example.com', phone: '4', address: 'A' },
            });

        expect(res.status).toBe(409);
        expect(dbMock.connection.rollback).toHaveBeenCalled();
    });
});

describe('POST /api/auth/login', () => {
    test('returns 404 when user does not exist', async () => {
        dbMock.enqueue([[]]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'ghost', password: 'whatever' });

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/invalid credentials/i);
    });

    test('returns 404 when password is wrong', async () => {
        const storedHash = await bcrypt.hash('correct-pw', 4);
        dbMock.enqueue([[{ id: 1, username: 'alice', password: storedHash, user_role: 'user' }]]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'alice', password: 'wrong-pw' });

        expect(res.status).toBe(404);
        expect(res.body.token).toBeUndefined();
    });

    test('returns 200 with a valid JWT when credentials are correct', async () => {
        const storedHash = await bcrypt.hash('right-pw', 4);
        dbMock.enqueue([[{ id: 5, username: 'alice', password: storedHash, user_role: 'user' }]]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'alice', password: 'right-pw' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(5);
        expect(decoded.username).toBe('alice');
        expect(decoded.role).toBe('user');
        expect(decoded.exp - decoded.iat).toBe(24 * 60 * 60);
    });

    test('issues an admin-role token for an admin user_role', async () => {
        const storedHash = await bcrypt.hash('rootpw', 4);
        dbMock.enqueue([[{ id: 1, username: 'root', password: storedHash, user_role: 'admin' }]]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'root', password: 'rootpw' });

        expect(res.status).toBe(200);
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.role).toBe('admin');
    });

    test('does not echo password or hash in the response', async () => {
        const storedHash = await bcrypt.hash('pw', 4);
        dbMock.enqueue([[{ id: 2, username: 'alice', password: storedHash, user_role: 'user' }]]);

        const app = buildApp();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'alice', password: 'pw' });

        const body = JSON.stringify(res.body);
        expect(body).not.toContain(storedHash);
        expect(body).not.toContain('pw');
    });
});
