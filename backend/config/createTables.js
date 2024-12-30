const getConnection = require('../config/database')


const createUserTable = `
    CREATE TABLE IF NOT EXISTS \`user\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`username\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`user_role\` enum('user','admin','customer') DEFAULT 'customer',
        \`userId\` int(11) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`userId\` (\`userId\`)
    );
`;

const createCustomerTable = `
    CREATE TABLE IF NOT EXISTS \`customers\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(255) DEFAULT NULL,
        \`address\` varchar(255) DEFAULT NULL,
        \`userId\` int(11) NOT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`customers_ibfk_1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE
    );
`;

const createOfficeTable = `
    CREATE TABLE IF NOT EXISTS \`offices\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`location\` varchar(255) NOT NULL,
        \`phone\` varchar(255) DEFAULT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
    );
`;

const createCarTable = `
    CREATE TABLE IF NOT EXISTS \`cars\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`model\` varchar(255) NOT NULL,
        \`year\` int(11) NOT NULL,
        \`plateId\` varchar(255) NOT NULL,
        \`status\` enum('active','out_of_service','rented') DEFAULT 'active',
        \`officeId\` int(11) NOT NULL,
        \`dailyRate\` decimal(10,2) NOT NULL,
        \`category\` enum('sedan','suv','sports','luxury','compact','van','pickup') NOT NULL,
        \`transmission\` enum('automatic','manual') NOT NULL,
        \`fuelType\` enum('gasoline','diesel','hybrid','electric') NOT NULL,
        \`seatingCapacity\` int(11) NOT NULL,
        \`features\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`features\`)),
        \`description\` text DEFAULT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`cars_ibfk_1\` FOREIGN KEY (\`officeId\`) REFERENCES \`offices\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE
    );
`;

const createReservationTable = `
    CREATE TABLE IF NOT EXISTS \`reservations\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`carId\` int(11) NOT NULL,
        \`customerId\` int(11) NOT NULL,
        \`startDate\` datetime NOT NULL,
        \`endDate\` datetime NOT NULL,
        \`status\` enum('pending','active','completed','cancelled') DEFAULT 'pending',
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`reservations_ibfk_1\` FOREIGN KEY (\`carId\`) REFERENCES \`cars\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`reservations_ibfk_10\` FOREIGN KEY (\`customerId\`) REFERENCES \`customers\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    );
`;

const createPaymentTable = `
    CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`reservationId\` int(11) NOT NULL,
        \`amount\` decimal(10,2) NOT NULL,
        \`paymentDate\` datetime DEFAULT NULL,
        \`paymentMethod\` enum('cash','credit_card') NOT NULL,
        \`paymentStatus\` enum('paid','unpaid') NOT NULL DEFAULT 'unpaid',
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`payments_ibfk_1\` FOREIGN KEY (\`reservationId\`) REFERENCES \`reservations\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    );
`;

async function createTables(){
    const connection = await getConnection();

    await connection.execute(createUserTable);
    console.log('User Table created or exists:');

    await connection.execute(createOfficeTable);
    console.log('Office Table created or exists:');

    await connection.execute(createCustomerTable);
    console.log('Customer Table created or exists:');

    await connection.execute(createCarTable);
    console.log('Car Table created or exists:');

    await connection.execute(createReservationTable);
    console.log('Reservation Table created or exists:');

    await connection.execute(createPaymentTable);
    console.log('Payments Table created or exists:');
}

module.exports = createTables;
