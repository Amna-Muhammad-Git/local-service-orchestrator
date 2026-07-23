-- Expected-failure tests for Phase 1 constraints.
-- Run this file against a disposable database. Every INSERT below should be rejected.
-- SQLite foreign keys must be enabled for the first test.

PRAGMA foreign_keys = ON;

-- 1. Invalid user_id and provider_id should be rejected by foreign keys.
INSERT INTO bookings (user_id, provider_id, booking_time, status)
VALUES (999, 999, '2026-08-01 10:00:00', 'pending');

-- 2. Invalid category should be rejected by the category CHECK constraint.
INSERT INTO providers (name, category, neighborhood_zone, rating)
VALUES ('Random Provider', 'plumbers', 'Gulshan', 4.0);

-- 3. Rating outside the 0-5 range should be rejected.
INSERT INTO providers (name, category, neighborhood_zone, rating)
VALUES ('Invalid Rating Provider', 'plumber', 'Gulshan', 6.0);

-- 4. Invalid booking status should be rejected.
INSERT INTO bookings (user_id, provider_id, booking_time, status)
VALUES (1, 1, '2026-08-01 10:00:00', 'requested');

-- 5. Duplicate email should be rejected by the UNIQUE constraint.
INSERT INTO users (name, email, password_hash)
VALUES ('Duplicate User', 'amna@example.com', 'mock_hash_duplicate');

-- 6. Required fields should be rejected by NOT NULL constraints.
INSERT INTO users (name, email, password_hash)
VALUES (NULL, 'null-name@example.com', 'mock_hash_null');
