-- Update users table with new usernames and roles
DELETE FROM users;

INSERT INTO users (id, name, password, role, photo) VALUES
('Prince', 'Prince', 'admin123', 'admin', 'https://pin.it/1UMt77Jy7'),
('Mohit Suhanda', 'Mohit Suhanda', 'admin123', 'admin', 'https://pin.it/1UMt77Jy7'),
('Krishna', 'Krishna', 'user123', 'user', 'https://pin.it/1UMt77Jy7'),
('Sachin', 'Sachin', 'user123', 'user', 'https://pin.it/1UMt77Jy7'),
('Bhavesh', 'Bhavesh', 'user123', 'user', 'https://pin.it/1UMt77Jy7'),
('Mohit S.', 'Mohit S.', 'user123', 'user', 'https://pin.it/1UMt77Jy7');