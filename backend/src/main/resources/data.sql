-- DEVELOPMENT_PASSWORD :  $2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO

INSERT INTO users (id, email, password, agree_to_terms, user_type, role)
VALUES (100, 'hotel@paradise.com', '$2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO', TRUE, 'OWNER', 'HOST');
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


INSERT INTO users (id, email, password, agree_to_terms, user_type, role)
VALUES (201, 'maria.garcia@example.com', '$2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO', TRUE, 'TRAVELER', 'USER');

INSERT INTO travelers (id, first_name, last_name, xp, level, points)
VALUES (
    201,
    'Maria',
    'Garcia',
    1960,
    4,
    100
);

INSERT INTO users (id, email, password, agree_to_terms, user_type, role)
VALUES (202, 'mike@trippy.com', '$2a$10$atPW6LHtb4uug8Iz5dPM0e9hmv5hjEzjwMjz3llwo2M9yiUDEhwFO', TRUE, 'TRAVELER', 'USER');

INSERT INTO travelers (id, first_name, last_name, xp, level, points)
VALUES (
    202,
    'Mike',
    'Chen',
    1270,
    3,
    360
);


INSERT INTO review (review_id, publication_id, user_id, publication_rating, review_content, created_at)
VALUES
    (1, 1, 201, 5, '¡Increíble! La pileta es hermosa y la atención 10/10.', '2024-05-20 08:00:00'),
    (2, 1, 202, 4, 'Muy buen hotel, la habitación era cómoda. El desayuno podría mejorar.', '2024-05-20 08:00:00');

INSERT INTO shop_items (title, icon, description, points_requiered)
VALUES
    ('Noche gratis', 'gi/GiNightSleep' ,'Una noche de alojamiento en hoteles seleccionados de la red', 29),
    ('Desayuno buffet', 'gi/GiSlicedBread' ,'Incluye desayuno completo para 2 personas en tu próxima estadía', 223),
    ('Cena para dos', 'gi/GiForkKnifeSpoon' ,'Menú completo de 3 pasos en restaurantes adheridos', 31),
    ('Descuento 50% Resto', 'gi/GiKnifeFork' , 'Aplicable en cualquier restaurante de la red', 42),
    ('City tour guiado', 'tb/TbTrekking' ,'Recorrido por los principales atractivos en la ciudad de tu proxima reserva', 51),
    ('Tour gastronomico', 'pi/PiChefHatThin' ,'Degustación de comida local', 16),
    ('Descuento 20% Hotel', 'fa/FaHotel', 'Aplicable en tu proxima reserva de hotel', 44),
    ('2x1 en cines', 'io5/IoTicket' , 'Solo aplicables a cadenas de cines de cinemark', 76);

-- ACTUALIZA EL CONTADOR DE IDS
-- Le dice a la secuencia que el próximo ID que debe generar es MAX(id) + 1
SELECT setval('publication_id_seq', (SELECT MAX(id) FROM publication));
SELECT setval('review_review_id_seq', (SELECT MAX(review_id) FROM review));

