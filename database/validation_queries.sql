PRAGMA foreign_keys = ON;
-- 1. Fetch all providers in a given zone
SELECT * FROM providers WHERE neighborhood_zone = 'Johar';

-- 2. Fetch all providers of a given category
SELECT * FROM providers WHERE category = 'electrician';

-- 3. Fetch all bookings for a specific user (join to get provider name too)
SELECT b.booking_id, u.name AS user_name, p.name AS provider_name, b.booking_time, b.status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN providers p ON b.provider_id = p.provider_id
WHERE u.user_id = 1;

-- 4. Fetch top-rated providers in a zone (mimics future ranking logic)
SELECT name, category, rating
FROM providers
WHERE neighborhood_zone = 'Johar'
ORDER BY rating DESC;
