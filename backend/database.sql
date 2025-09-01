CREATE DATABASE IF NOT EXISTS malariaguard_db;
USE malariaguard_db;

CREATE TABLE IF NOT EXISTS symptom_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symptoms TEXT NOT NULL,
    risk_score FLOAT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS prevention_tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample prevention tips
INSERT INTO prevention_tips (title, description, category) VALUES
('Use Insecticide-Treated Nets', 'Sleep under insecticide-treated mosquito nets (ITNs) every night to prevent mosquito bites.', 'Protection'),
('Indoor Residual Spraying', 'Use indoor residual spraying (IRS) with insecticides to control mosquito populations in your home.', 'Protection'),
('Wear Protective Clothing', 'Wear long-sleeved shirts and long pants, especially during evening hours when mosquitoes are most active.', 'Protection'),
('Take Preventive Medication', 'If living in or traveling to high-risk areas, take antimalarial drugs as prescribed by healthcare providers.', 'Medication'),
('Eliminate Breeding Sites', 'Remove standing water around your home where mosquitoes can breed, such as in containers, old tires, or flower pots.', 'Environment');

-- Insert sample health centers
INSERT INTO health_centers (name, address, latitude, longitude, contact) VALUES
('Nairobi Malaria Clinic', '123 Health Street, Nairobi, Kenya', -1.2921, 36.8219, '+254-700-111-111'),
('Kampala Health Center', '456 Wellness Avenue, Kampala, Uganda', 0.3476, 32.5825, '+256-700-222-222'),
('Lagos Medical Facility', '789 Care Road, Lagos, Nigeria', 6.5244, 3.3792, '+234-700-333-333');