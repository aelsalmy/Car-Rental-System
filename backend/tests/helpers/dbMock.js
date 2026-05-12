const createPoolMock = () => {
    const responses = [];

    const makeExecute = () => jest.fn(async (sql, params) => {
        if (responses.length === 0) {
            return [[]];
        }
        const next = responses.shift();
        if (next instanceof Error) throw next;
        if (typeof next === 'function') return next(sql, params);
        return next;
    });

    const connection = {
        beginTransaction: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        release: jest.fn(),
    };
    connection.execute = makeExecute();

    const pool = {
        execute: makeExecute(),
        getConnection: jest.fn().mockResolvedValue(connection),
    };

    return {
        pool,
        connection,
        enqueue(...items) { responses.push(...items); },
        reset() {
            responses.length = 0;
            pool.execute.mockClear();
            pool.getConnection.mockClear();
            connection.execute.mockClear();
            connection.beginTransaction.mockClear();
            connection.commit.mockClear();
            connection.rollback.mockClear();
            connection.release.mockClear();
        },
    };
};

module.exports = { createPoolMock };
