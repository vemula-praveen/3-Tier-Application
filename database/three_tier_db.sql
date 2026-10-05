CREATE DATABASE IF NOT EXISTS three_tier_db;

USE three_tier_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO users (name)
SELECT 'Praveen'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE name = 'Praveen');

INSERT INTO users (name)
SELECT 'Ravi'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE name = 'Ravi');
