-- Crear tabla de experiencias
CREATE TABLE IF NOT EXISTS experiences (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo solo si la tabla está vacía
INSERT INTO experiences (title, category, location, rating, reviews, price, image, xp_reward, description)
SELECT * FROM (VALUES
    ('Grand Hotel Paradise', 'hotel', 'Bali, Indonesia', 4.8, 324, 150.00, '/placeholder-hotel.jpg', 50, 'Luxury beachfront resort with stunning ocean views'),
    ('Sakura Sushi Bar', 'restaurant', 'Tokyo, Japan', 4.9, 156, 80.00, '/placeholder-restaurant.jpg', 30, 'Authentic Japanese cuisine in the heart of Tokyo'),
    ('Machu Picchu Adventure', 'tour', 'Cusco, Peru', 4.7, 89, 200.00, '/placeholder-tour.jpg', 100, 'Guided hiking tour to the ancient Inca citadel'),
    ('Ocean Breeze Hotel', 'hotel', 'Maldives', 4.9, 245, 300.00, '/placeholder-hotel.jpg', 60, 'Overwater bungalows in paradise'),
    ('Pasta & Co', 'restaurant', 'Rome, Italy', 4.6, 198, 45.00, '/placeholder-restaurant.jpg', 25, 'Traditional Italian pasta in cozy setting'),
    ('Safari Adventure', 'tour', 'Serengeti, Tanzania', 4.8, 67, 350.00, '/placeholder-tour.jpg', 120, 'Wildlife safari experience of a lifetime'),
    ('Skyline Tower Hotel', 'hotel', 'New York, USA', 4.7, 412, 250.00, '/placeholder-hotel.jpg', 55, 'Luxury hotel with panoramic city views'),
    ('La Brasserie Française', 'restaurant', 'Paris, France', 4.8, 289, 95.00, '/placeholder-restaurant.jpg', 35, 'Authentic French cuisine in historic setting'),
    ('Amazon Jungle Trek', 'tour', 'Manaus, Brazil', 4.6, 45, 180.00, '/placeholder-tour.jpg', 90, 'Explore the heart of the Amazon rainforest'),
    ('Boutique Beach Resort', 'hotel', 'Phuket, Thailand', 4.5, 167, 120.00, '/placeholder-hotel.jpg', 45, 'Intimate beachfront resort with Thai hospitality'),
    ('Tapas Bar El Toro', 'restaurant', 'Barcelona, Spain', 4.7, 223, 55.00, '/placeholder-restaurant.jpg', 28, 'Traditional Spanish tapas and wine'),
    ('Northern Lights Tour', 'tour', 'Reykjavik, Iceland', 4.9, 134, 275.00, '/placeholder-tour.jpg', 110, 'Chase the aurora borealis in Iceland'),
    ('Mountain Lodge Retreat', 'hotel', 'Swiss Alps, Switzerland', 4.8, 178, 280.00, '/placeholder-hotel.jpg', 58, 'Alpine luxury with breathtaking mountain views'),
    ('Sushi Master Class', 'restaurant', 'Kyoto, Japan', 4.9, 92, 150.00, '/placeholder-restaurant.jpg', 40, 'Learn from master chefs and enjoy premium sushi'),
    ('Great Barrier Reef Dive', 'tour', 'Cairns, Australia', 4.7, 201, 220.00, '/placeholder-tour.jpg', 105, 'Scuba diving adventure in the world''s largest reef')
) AS v(title, category, location, rating, reviews, price, image, xp_reward, description)
WHERE NOT EXISTS (SELECT 1 FROM experiences LIMIT 1);

-- Crear índices para mejorar el rendimiento de búsqueda
CREATE INDEX IF NOT EXISTS idx_experiences_title ON experiences(title);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON experiences(location);
CREATE INDEX IF NOT EXISTS idx_experiences_rating ON experiences(rating);
CREATE INDEX IF NOT EXISTS idx_experiences_price ON experiences(price);