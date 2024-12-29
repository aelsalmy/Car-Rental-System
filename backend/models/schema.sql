-- User table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_role ENUM('user', 'admin', 'customer') DEFAULT 'customer',
    userId INT,
    CONSTRAINT fk_user_customer FOREIGN KEY (userId) REFERENCES customers(id)
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    plateId VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('active', 'out_of_service', 'rented') DEFAULT 'active',
    officeId INT NOT NULL,
    dailyRate DECIMAL(10, 2) NOT NULL,
    category ENUM('sedan', 'suv', 'sports', 'luxury', 'compact', 'van', 'pickup') NOT NULL,
    transmission ENUM('automatic', 'manual') NOT NULL,
    fuelType ENUM('gasoline', 'diesel', 'hybrid', 'electric') NOT NULL,
    seatingCapacity INT NOT NULL,
    features JSON NOT NULL,
    description TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    INDEX idx_office (officeId),
    CONSTRAINT fk_car_office FOREIGN KEY (officeId) REFERENCES offices(id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255),
    address VARCHAR(255),
    userId INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_customer_user FOREIGN KEY (userId) REFERENCES user(id)
);

-- Offices table
CREATE TABLE IF NOT EXISTS offices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carId INT NOT NULL,
    customerId INT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    INDEX idx_car (carId),
    INDEX idx_customer (customerId),
    CONSTRAINT fk_reservation_car FOREIGN KEY (carId) REFERENCES cars(id),
    CONSTRAINT fk_reservation_customer FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservationId INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paymentDate DATETIME,
    paymentMethod ENUM('cash', 'credit_card') NOT NULL,
    paymentStatus ENUM('paid', 'unpaid') DEFAULT 'unpaid',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CONSTRAINT fk_payment_reservation FOREIGN KEY (reservationId) REFERENCES reservations(id)
);

-- Triggers for validation
DELIMITER //

-- Trigger to validate reservation dates
CREATE TRIGGER before_reservation_insert
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
    IF NEW.startDate < NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot make reservations for past dates';
    END IF;
    
    IF NEW.endDate <= NEW.startDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'End date must be after start date';
    END IF;
    
    -- Check if car exists and is not out of service
    IF NOT EXISTS (SELECT 1 FROM cars WHERE id = NEW.carId AND status != 'out_of_service') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Car is not available for reservation';
    END IF;
    
    -- Check for overlapping active reservations
    IF EXISTS (
        SELECT 1 FROM reservations 
        WHERE carId = NEW.carId 
        AND status = 'active'
        AND (
            (NEW.startDate BETWEEN startDate AND endDate)
            OR (NEW.endDate BETWEEN startDate AND endDate)
        )
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Car already has an active reservation for these dates';
    END IF;
    
    -- Set createdAt and updatedAt
    SET NEW.createdAt = NOW();
    SET NEW.updatedAt = NOW();
END //

-- Trigger to update updatedAt timestamp
CREATE TRIGGER before_reservation_update
BEFORE UPDATE ON reservations
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' THEN
        -- Check for overlapping active reservations
        IF EXISTS (
            SELECT 1 FROM reservations 
            WHERE carId = NEW.carId 
            AND id != NEW.id
            AND status = 'active'
            AND (
                (NEW.startDate BETWEEN startDate AND endDate)
                OR (NEW.endDate BETWEEN startDate AND endDate)
            )
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot activate reservation - there is an overlapping active reservation';
        END IF;
    END IF;
    SET NEW.updatedAt = NOW();
END //

-- Triggers for other tables to handle createdAt and updatedAt
CREATE TRIGGER before_car_insert
BEFORE INSERT ON cars
FOR EACH ROW
BEGIN
    SET NEW.createdAt = NOW();
    SET NEW.updatedAt = NOW();
END //

CREATE TRIGGER before_car_update
BEFORE UPDATE ON cars
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END //

CREATE TRIGGER before_customer_insert
BEFORE INSERT ON customers
FOR EACH ROW
BEGIN
    SET NEW.createdAt = NOW();
    SET NEW.updatedAt = NOW();
END //

CREATE TRIGGER before_customer_update
BEFORE UPDATE ON customers
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END //

CREATE TRIGGER before_office_insert
BEFORE INSERT ON offices
FOR EACH ROW
BEGIN
    SET NEW.createdAt = NOW();
    SET NEW.updatedAt = NOW();
END //

CREATE TRIGGER before_office_update
BEFORE UPDATE ON offices
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END //

CREATE TRIGGER before_payment_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    SET NEW.createdAt = NOW();
    SET NEW.updatedAt = NOW();
END //

CREATE TRIGGER before_payment_update
BEFORE UPDATE ON payments
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END //

DELIMITER ;
