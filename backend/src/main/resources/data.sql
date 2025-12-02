-- DEVELOPMENT_PASSWORD :  $2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO

INSERT INTO users (id, email, password, agree_to_terms, user_type)
VALUES (100, 'hotel@paradise.com', '$2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO', TRUE, 'OWNER');
DROP TABLE IF EXISTS reservation;
-- eliminar tablas dependientes y la tabla base con CASCADE
DROP TABLE IF EXISTS reservation_activity, reservation_restaurant, room_type, reservation_room_details, reservation_coworking, reservation_hotel, reservation CASCADE;

-- Tabla única de reservas con todos los campos (nullable los específicos)
CREATE TABLE IF NOT EXISTS reservation (
    id SERIAL PRIMARY KEY,
    publication_id INT NOT NULL REFERENCES publication(id) ON DELETE CASCADE,
    traveler_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reservation_date TIMESTAMP NOT NULL DEFAULT NOW(),

    reservation_type VARCHAR(20),
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING')),
    notes TEXT,

    start_date TIMESTAMP,
    end_date TIMESTAMP,
    check_in DATE,
    check_out DATE,
    reservation_datetime TIMESTAMP,
    start_datetime TIMESTAMP,

    guest_count INT,
    room_count INT,
    cover_count INT,
    participant_count INT
);

INSERT INTO business_owners (id, business_name, business_description, verified)
VALUES (
    100,
    'Paradise resorts',
    'Luxury beachfront hotel with spa and restaurant',
    TRUE
);

-- --- MOCKS DE PUBLICACIONES ---

-- 1. Hotel (ID 1)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    room_count, capacity
) VALUES (
             1, 'HOTEL', 'Gran Hotel Trippy', 'El mejor hotel...', 150.00, 100, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
             'Av. Colón 1234', 'Mar del Plata', 'Buenos Aires', 'Argentina', '7600',
             50, 120
         );

-- 2. Restaurante (ID 2)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    cuisine_type, price_range, opening_start, opening_end, menu_url, capacity
) VALUES (
             2, 'RESTAURANT', 'Restaurante La Paella', 'Auténtica comida...', 45.50, 100, 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
             'Av. de Mayo 567', 'Buenos Aires', 'CABA', 'Argentina', '1084',
             'Española', '$$$', '12:00', '23:00', '...', '30'
         );

-- 3. Actividad (ID 3)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    duration_in_hours, meeting_point, what_is_included, activity_level, language, max_group_size
) VALUES (
             3, 'ACTIVITY', 'Tour de Grafitis...', 'Recorre las calles...', 25.00, 100, 'https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/ElRegreso980.jpg',
             'Honduras y Serrano', 'Buenos Aires', 'CABA', 'Argentina', '1414',
             3, 'Esquina...', 'Guía...', 'Bajo', 'Español/Inglés', 20
         );

-- 4. Coworking (ID 4)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    price_per_day, price_per_month, capacity
) VALUES (
             4, 'COWORKING', 'Trippy WorkSpace', 'Oficina compartida...', 30.00, 100, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
             'Av. Vélez Sarsfield 800', 'Córdoba', 'Córdoba', 'Argentina', '5000',
             30.00, 450.00, 100
         );

-- --- DETALLES DE PUBLICACIONES (PARA US 11) ---

-- Galería de Imágenes (para Publication.imageUrls)
-- Vamos a agregarle una galería al Hotel (ID 1)
INSERT INTO publication_images (publication_id, image_url)
VALUES
    (1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'), -- La principal
    (1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600'), -- Foto de la pileta
    (1, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600'), -- Foto de la habitación
    (1, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600'); -- Foto del lobby

-- Servicios de Coworking (ID 4)
INSERT INTO coworking_services (publication_id, service)
VALUES
    (4, 'WiFi Alta Velocidad'),
    (4, 'Café Ilimitado'),
    (4, 'Salas de Reunión'),
    (4, 'Impresora');

-- --- MOCKS DE RESEÑAS (Reviews) ---
-- NOTA: Estos inserts NO funcionarán hasta que no:
-- 1. Creen la entidad Review.java y la tabla 'review'
-- 2. Modifiquen PublicationService.java para que busque reseñas



INSERT INTO users (id, email, password, agree_to_terms, user_type, role)
VALUES (201, 'maria.garcia@example.com', '$2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO', TRUE, 'TRAVELER', 'USER');

INSERT INTO travelers (id, first_name, last_name, xp, level, trippy_coins)
VALUES (
    201,
    'Maria',
    'Garcia',
    2200,
    4,
    124
);

INSERT INTO users (id, email, password, agree_to_terms, user_type, role)
VALUES (202, 'mike@trippy.com', '$2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO', TRUE, 'TRAVELER', 'USER');

INSERT INTO travelers (id, first_name, last_name, xp, level, trippy_coins)
VALUES (
    202,
    'Mike',
    'Chen',
    1400,
    3,
    500
);


INSERT INTO review (review_id, publication_id, user_id, publication_rating, review_content, created_at)
VALUES
    (1, 1, 201, 5, '¡Increíble! La pileta es hermosa y la atención 10/10.', '2024-05-20 08:00:00'),
    (2, 1, 202, 4, 'Muy buen hotel, la habitación era cómoda. El desayuno podría mejorar.', '2024-05-20 08:00:00');

-- ACTUALIZA EL CONTADOR DE IDS
-- Le dice a la secuencia que el próximo ID que debe generar es MAX(id) + 1
SELECT setval('publication_id_seq', (SELECT MAX(id) FROM publication));
SELECT setval('review_review_id_seq', (SELECT MAX(review_id) FROM review));

-- ============================================================
-- Script completo para crear e insertar beneficios
-- Base de datos: PostgreSQL
-- ============================================================

-- 1. Verificar si la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'benefits';

-- 2. Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS benefits (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL,
    cost INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    discount_percentage INTEGER,
    xp_bonus INTEGER,
    single_use BOOLEAN NOT NULL DEFAULT true
);

-- 3. Crear la tabla de beneficios de usuario si no existe
CREATE TABLE IF NOT EXISTS user_benefits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    benefit_id BIGINT NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    used_date TIMESTAMP,
    FOREIGN KEY (benefit_id) REFERENCES benefits(id) ON DELETE CASCADE
);

-- 4. Limpiar datos existentes (opcional - solo para desarrollo)
-- TRUNCATE TABLE user_benefits RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE benefits RESTART IDENTITY CASCADE;

-- 5. Insertar beneficios de DESCUENTO
INSERT INTO benefits (name, description, cost, type, discount_percentage, single_use) 
VALUES 
('Descuento 5%', 'Obtén un 5% de descuento en tu próxima reserva', 200, 'DISCOUNT', 5, true),
('Descuento 10%', 'Obtén un 10% de descuento en tu próxima reserva', 400, 'DISCOUNT', 10, true),
('Descuento 15%', 'Obtén un 15% de descuento en tu próxima reserva', 600, 'DISCOUNT', 15, true),
('Descuento 20%', 'Obtén un 20% de descuento en tu próxima reserva', 900, 'DISCOUNT', 20, true),
('Mega Descuento 25%', '¡Descuento especial del 25% en tu próxima reserva!', 1200, 'DISCOUNT', 25, true)
ON CONFLICT DO NOTHING;

-- 6. Insertar beneficios de BONUS XP
INSERT INTO benefits (name, description, cost, type, xp_bonus, single_use) 
VALUES 
('Bonus XP +50', 'Gana 50 XP adicionales en tu próxima reserva', 150, 'XP_BONUS', 50, true),
('Bonus XP +100', 'Gana 100 XP adicionales en tu próxima reserva', 300, 'XP_BONUS', 100, true),
('Bonus XP +200', 'Gana 200 XP adicionales en tu próxima reserva', 550, 'XP_BONUS', 200, true),
('Super Bonus XP +500', '¡Gana 500 XP adicionales en tu próxima reserva!', 1000, 'XP_BONUS', 500, true)
ON CONFLICT DO NOTHING;

-- 7. Insertar beneficios de SOPORTE PRIORITARIO
INSERT INTO benefits (name, description, cost, type, single_use) 
VALUES 
('Soporte Prioritario 24h', 'Acceso a soporte prioritario durante 24 horas', 300, 'PRIORITY_SUPPORT', true),
('Soporte Prioritario Mensual', 'Acceso a soporte prioritario durante un mes', 800, 'PRIORITY_SUPPORT', true)
ON CONFLICT DO NOTHING;

-- 8. Insertar beneficios de UPGRADE GRATIS
INSERT INTO benefits (name, description, cost, type, single_use) 
VALUES 
('Upgrade de Categoría', 'Upgrade gratuito a la siguiente categoría disponible', 500, 'FREE_UPGRADE', true),
('Upgrade Premium', 'Upgrade gratuito a categoría premium según disponibilidad', 1000, 'FREE_UPGRADE', true)
ON CONFLICT DO NOTHING;

-- 9. Verificar que se insertaron correctamente
SELECT 
  id,
  name,
  cost,
  type,
  COALESCE(discount_percentage, 0) as discount,
  COALESCE(xp_bonus, 0) as xp_bonus,
  single_use
FROM benefits 
ORDER BY cost ASC;

-- 10. Contar cuántos beneficios hay
SELECT COUNT(*) as total_benefits FROM benefits;

-- Resultado esperado: 13 beneficios
-- 5 DISCOUNT + 4 XP_BONUS + 2 PRIORITY_SUPPORT + 2 FREE_UPGRADE = 13