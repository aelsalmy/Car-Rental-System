const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateAdmin } = require('../../middleware/auth');

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    console.log.mockRestore && console.log.mockRestore();
    console.error.mockRestore && console.error.mockRestore();
});

function buildRes() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; },
    };
}

function tokenFor(payload, opts = {}) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h', ...opts });
}

describe('authenticateToken middleware', () => {
    test('returns 401 when Authorization header is missing', () => {
        const req = { headers: {} };
        const res = buildRes();
        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: 'Authentication token required' });
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when token is malformed', (done) => {
        const req = { headers: { authorization: 'Bearer not-a-real-token' } };
        const res = buildRes();
        const next = jest.fn();

        authenticateToken(req, res, next);

        setImmediate(() => {
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: 'Invalid or expired token' });
            expect(next).not.toHaveBeenCalled();
            done();
        });
    });

    test('returns 403 when token is signed with the wrong secret', (done) => {
        const token = jwt.sign({ id: 1, username: 'a', role: 'user' }, 'WRONG_SECRET');
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = buildRes();
        const next = jest.fn();

        authenticateToken(req, res, next);

        setImmediate(() => {
            expect(res.statusCode).toBe(403);
            expect(next).not.toHaveBeenCalled();
            done();
        });
    });

    test('returns 403 when token is expired', (done) => {
        const token = tokenFor({ id: 1, username: 'a', role: 'user' }, { expiresIn: '-1h' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = buildRes();
        const next = jest.fn();

        authenticateToken(req, res, next);

        setImmediate(() => {
            expect(res.statusCode).toBe(403);
            expect(next).not.toHaveBeenCalled();
            done();
        });
    });

    test('populates req.user and calls next() for a valid token', (done) => {
        const token = tokenFor({ id: 42, username: 'alice', role: 'user' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = buildRes();
        const next = jest.fn();

        authenticateToken(req, res, next);

        setImmediate(() => {
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(42);
            expect(req.user.username).toBe('alice');
            expect(req.user.role).toBe('user');
            done();
        });
    });
});

describe('authenticateAdmin middleware', () => {
    test('returns 401 when Authorization header is missing', () => {
        const req = { headers: {} };
        const res = buildRes();
        const next = jest.fn();

        authenticateAdmin(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 for a non-admin (customer) token', (done) => {
        const token = tokenFor({ id: 1, username: 'carol', role: 'user' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = buildRes();
        const next = jest.fn();

        authenticateAdmin(req, res, next);

        setImmediate(() => {
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: 'Access denied. Admin privileges required.' });
            expect(next).not.toHaveBeenCalled();
            done();
        });
    });

    test('populates req.user and calls next() for an admin token', (done) => {
        const token = tokenFor({ id: 9, username: 'root', role: 'admin' });
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = buildRes();
        const next = jest.fn();

        authenticateAdmin(req, res, next);

        setImmediate(() => {
            expect(next).toHaveBeenCalledTimes(1);
            expect(req.user.role).toBe('admin');
            done();
        });
    });
});
