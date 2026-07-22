-- USERS TABLE
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

-- PROVIDERS TABLE
CREATE TABLE providers (
    provider_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('plumber', 'electrician', 'tutor', 'carpenter', 'painter')),
    neighborhood_zone TEXT NOT NULL CHECK (neighborhood_zone IN ('Gulshan', 'Johar', 'Clifton', 'DHA', 'Nazimabad')),
    rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5)
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    booking_time DATETIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (provider_id) REFERENCES providers(provider_id)
);