PRAGMA foreign_keys=ON;

-- USERS
insert into users(name, email,password_hash) values
-- These are mock password hashes for seed data only; never use them as real credentials.
('Amna Muhammad', 'amna@example.com', 'hashed_pw_1'),
('Bilal Khan', 'bilal@example.com', 'hashed_pw_2'),
('Sara Ahmed', 'sara@example.com', 'hashed_pw_3');

-- PROVIDERS
INSERT INTO providers (name, category, neighborhood_zone, rating) VALUES
('Ali Plumbing Services', 'plumber', 'Gulshan', 4.5),
('Fast Fix Electricians', 'electrician', 'Johar', 4.2),
('Bright Minds Tutoring', 'tutor', 'DHA', 4.8),
('Zafar Carpentry', 'carpenter', 'Nazimabad', 3.9),
('Clifton Paint Co.', 'painter', 'Clifton', 4.0),
('Quick Electric Johar', 'electrician', 'Johar', 3.7),
('Gulshan Home Electric', 'electrician', 'Gulshan', 4.1),
('Johar Pipe Masters', 'plumber', 'Johar', 4.3),
('Clifton Learning Hub', 'tutor', 'Clifton', 4.6),
('DHA Woodworks', 'carpenter', 'DHA', 4.4),
('Nazimabad Color Experts', 'painter', 'Nazimabad', 4.2);

-- BOOKINGS
INSERT INTO bookings (user_id, provider_id, booking_time, status) VALUES
(1, 1, '2026-07-25 10:00:00', 'pending'),
(2, 2, '2026-07-26 14:30:00', 'confirmed'),
(3, 3, '2026-07-24 09:00:00', 'completed'),
(1, 4, '2026-07-27 11:00:00', 'pending');
