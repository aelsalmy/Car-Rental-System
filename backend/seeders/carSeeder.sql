-- Insert sample cars with diverse specifications
INSERT INTO Cars (model, year, plateId, status, officeId, dailyRate, category, transmission, fuelType, seatingCapacity, features, description, createdAt, updatedAt) VALUES
-- Sedans
('Toyota Camry', 2023, 'ABC123', 'active', 1, 45.00, 'sedan', 'automatic', 'gasoline', 5, '["Bluetooth","Backup Camera","Cruise Control"]', 'Comfortable mid-size sedan with excellent fuel economy', NOW(), NOW()),
('Honda Accord', 2023, 'DEF456', 'active', 1, 48.00, 'sedan', 'automatic', 'hybrid', 5, '["Lane Departure Warning","Apple CarPlay","Android Auto"]', 'Hybrid sedan with advanced safety features', NOW(), NOW()),
('BMW 3 Series', 2023, 'GHI789', 'active', 2, 75.00, 'sedan', 'automatic', 'gasoline', 5, '["Leather Seats","Navigation","Premium Sound"]', 'Luxury sports sedan with premium features', NOW(), NOW()),
('Mercedes C-Class', 2023, 'JKL012', 'active', 2, 80.00, 'sedan', 'automatic', 'gasoline', 5, '["Heated Seats","Sunroof","Premium Audio"]', 'Premium luxury sedan with elegant design', NOW(), NOW()),
('Hyundai Sonata', 2023, 'MNO345', 'active', 1, 42.00, 'sedan', 'automatic', 'hybrid', 5, '["Smart Cruise Control","Wireless Charging","BlueLink"]', 'Modern sedan with hybrid efficiency', NOW(), NOW()),

-- SUVs
('Toyota RAV4', 2023, 'PQR678', 'active', 1, 55.00, 'suv', 'automatic', 'hybrid', 5, '["All-Wheel Drive","Safety Sense","Roof Rails"]', 'Popular compact SUV with hybrid powertrain', NOW(), NOW()),
('Honda CR-V', 2023, 'STU901', 'active', 2, 52.00, 'suv', 'automatic', 'gasoline', 5, '["Honda Sensing","Magic Seats","Hands-free Tailgate"]', 'Versatile SUV with spacious interior', NOW(), NOW()),
('Ford Explorer', 2023, 'VWX234', 'active', 1, 65.00, 'suv', 'automatic', 'gasoline', 7, '["Third Row Seating","4WD","Terrain Management"]', 'Large SUV perfect for families', NOW(), NOW()),
('Jeep Grand Cherokee', 2023, 'YZA567', 'active', 2, 70.00, 'suv', 'automatic', 'gasoline', 5, '["Off-road Capability","Premium Interior","Tow Package"]', 'Capable SUV with luxury features', NOW(), NOW()),
('Hyundai Tucson', 2023, 'BCD890', 'active', 1, 48.00, 'suv', 'automatic', 'hybrid', 5, '["Panoramic Roof","Digital Cockpit","HTRAC AWD"]', 'Modern compact SUV with hybrid efficiency', NOW(), NOW()),

-- Sports Cars
('Porsche 911', 2023, 'EFG123', 'active', 2, 200.00, 'sports', 'automatic', 'gasoline', 2, '["Sport Chrono","Launch Control","Sport Exhaust"]', 'Iconic sports car with incredible performance', NOW(), NOW()),
('Chevrolet Corvette', 2023, 'HIJ456', 'active', 2, 180.00, 'sports', 'automatic', 'gasoline', 2, '["Performance Data Recorder","Magnetic Ride","Head-Up Display"]', 'American sports car with supercar performance', NOW(), NOW()),
('BMW M4', 2023, 'KLM789', 'active', 2, 150.00, 'sports', 'automatic', 'gasoline', 4, '["M Sport Differential","Carbon Roof","Track Package"]', 'High-performance luxury sports coupe', NOW(), NOW()),
('Audi RS5', 2023, 'NOP012', 'active', 2, 160.00, 'sports', 'automatic', 'gasoline', 4, '["Quattro AWD","Sport Seats","Virtual Cockpit"]', 'Premium sports coupe with all-weather capability', NOW(), NOW()),
('Toyota Supra', 2023, 'QRS345', 'active', 1, 120.00, 'sports', 'automatic', 'gasoline', 2, '["Launch Control","Sport Mode","Adaptive Suspension"]', 'Modern sports car with racing heritage', NOW(), NOW()),

-- Luxury Cars
('Mercedes S-Class', 2023, 'TUV678', 'active', 2, 250.00, 'luxury', 'automatic', 'hybrid', 5, '["Executive Seats","Air Suspension","Night Vision"]', 'Ultimate luxury sedan with cutting-edge technology', NOW(), NOW()),
('BMW 7 Series', 2023, 'WXY901', 'active', 2, 240.00, 'luxury', 'automatic', 'hybrid', 5, '["Executive Lounge","Theater Screen","Air Suspension"]', 'Flagship luxury sedan with premium features', NOW(), NOW()),
('Audi A8', 2023, 'ZAB234', 'active', 2, 230.00, 'luxury', 'automatic', 'hybrid', 5, '["Predictive Suspension","Rear Seat Entertainment","Matrix LED"]', 'Premium luxury sedan with advanced technology', NOW(), NOW()),
('Lexus LS', 2023, 'CDE567', 'active', 2, 220.00, 'luxury', 'automatic', 'hybrid', 5, '["Mark Levinson Audio","Kiriko Glass","Air Suspension"]', 'Japanese luxury with exceptional craftsmanship', NOW(), NOW()),
('Genesis G90', 2023, 'FGH890', 'active', 2, 200.00, 'luxury', 'automatic', 'gasoline', 5, '["Premium Audio","Massage Seats","Remote Smart Parking"]', 'Modern luxury sedan with value proposition', NOW(), NOW()),

-- Compact Cars
('Toyota Corolla', 2023, 'IJK123', 'active', 1, 35.00, 'compact', 'automatic', 'gasoline', 5, '["Toyota Safety Sense","Apple CarPlay","Android Auto"]', 'Reliable compact car with good fuel economy', NOW(), NOW()),
('Honda Civic', 2023, 'LMN456', 'active', 1, 38.00, 'compact', 'automatic', 'gasoline', 5, '["Honda Sensing","Sport Mode","Wireless CarPlay"]', 'Sporty compact car with modern features', NOW(), NOW()),
('Volkswagen Golf', 2023, 'OPQ789', 'active', 1, 40.00, 'compact', 'automatic', 'gasoline', 5, '["Digital Cockpit","IQ.DRIVE","Ambient Lighting"]', 'Premium compact car with German engineering', NOW(), NOW()),
('Mazda 3', 2023, 'RST012', 'active', 1, 39.00, 'compact', 'automatic', 'gasoline', 5, '["i-Activsense","Bose Audio","Head-up Display"]', 'Upscale compact car with sporty handling', NOW(), NOW()),
('Hyundai Elantra', 2023, 'UVW345', 'active', 1, 36.00, 'compact', 'automatic', 'gasoline', 5, '["SmartSense","Digital Key","Wireless Charging"]', 'Modern compact car with bold design', NOW(), NOW()),

-- Vans
('Honda Odyssey', 2023, 'XYZ678', 'active', 1, 75.00, 'van', 'automatic', 'gasoline', 8, '["Magic Slide Seats","Rear Entertainment","Vacuum"]', 'Family minivan with versatile interior', NOW(), NOW()),
('Toyota Sienna', 2023, 'ABC901', 'active', 1, 78.00, 'van', 'automatic', 'hybrid', 8, '["All-Wheel Drive","Captain Chairs","Power Doors"]', 'Hybrid minivan with excellent efficiency', NOW(), NOW()),
('Chrysler Pacifica', 2023, 'DEF234', 'active', 1, 72.00, 'van', 'automatic', 'hybrid', 7, '["Stow n Go","Theater System","Panoramic Roof"]', 'Premium minivan with flexible seating', NOW(), NOW()),
('Kia Carnival', 2023, 'GHI567', 'active', 1, 70.00, 'van', 'automatic', 'gasoline', 8, '["VIP Seats","Dual Screens","Safe Exit"]', 'Modern minivan with SUV styling', NOW(), NOW()),
('Mercedes Sprinter', 2023, 'JKL890', 'active', 1, 95.00, 'van', 'automatic', 'diesel', 12, '["High Roof","Partition","Loading Assist"]', 'Commercial van with passenger configuration', NOW(), NOW());
