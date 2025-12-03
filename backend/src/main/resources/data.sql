INSERT INTO users (id, email, password, agree_to_terms, user_type)
VALUES (100, 'hotel@paradise.com', 'hashed_password_789', TRUE, 'OWNER');
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



INSERT INTO users (id, email, password, agree_to_terms, user_type)
VALUES (201, 'maria.garcia@example.com', 'hashed_password_456', TRUE, 'TRAVELER');

INSERT INTO travelers (id, first_name, last_name, xp, level)
VALUES (
    201,
    'Maria',
    'Garcia',
    200,
    4
);

INSERT INTO users (id, email, password, agree_to_terms, user_type)
VALUES (202, 'mike@trippy.com', 'hashed_password_456', TRUE, 'TRAVELER');

INSERT INTO travelers (id, first_name, last_name, xp, level)
VALUES (
    202,
    'Mike',
    'Chen',
    170,
    3
);


INSERT INTO review (review_id, publication_id, user_id, publication_rating, review_content, created_at)
VALUES
    (1, 1, 201, 5, '¡Increíble! La pileta es hermosa y la atención 10/10.', '2024-05-20 08:00:00'),
    (2, 1, 202, 4, 'Muy buen hotel, la habitación era cómoda. El desayuno podría mejorar.', '2024-05-20 08:00:00');

-- Agregar usuario owner "El Mas Grande" con password hasheado de "123456789"
INSERT INTO users (id, email, password, agree_to_terms, user_type, role, "token-verified")
VALUES (1, 'asd@gmail.com', '$2a$10$ewqlk2zysNDd47IVB17TGe1fUqgS4yO7u/LpSG22V7UqrldUswOya', TRUE, 'OWNER', 'HOST', '3c34b596-aec0-4e1d-88f4-4e7618e3b89b');
-- Agregar el business owner
INSERT INTO business_owners (id, business_name, business_description, verified)
VALUES (
    1,
    'El Mas Grande',
    'El restaurante más grande y famoso de la ciudad',
    TRUE
);

-- Agregar publicación del restaurante
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    cuisine_type, price_range, opening_start, opening_end, menu_url, capacity
) VALUES (
    5, 'RESTAURANT', 'El Mas Grande Restaurante', 'El restaurante más grande ambientado en river para una experiencia Riverplatense', 75.00, 1, 'https://plus.unsplash.com/premium_photo-1670984940113-f3aa1cd1309a?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'Av. Cabildo 123', 'Buenos Aires', 'CABA', 'Argentina', '1001',
    'Argentina', '$$$', '10:00', '23:00', 'https://elmasgrande.com/menu', 200
);

-- ACTUALIZA EL CONTADOR DE IDS
-- Le dice a la secuencia que el próximo ID que debe generar es MAX(id) + 1
SELECT setval('publication_id_seq', (SELECT MAX(id) FROM publication));
SELECT setval('review_review_id_seq', (SELECT MAX(review_id) FROM review));
-- ACTUALIZA EL CONTADOR DE IDS DE USUARIOS (ESTO FALTABA)
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
-- $2a$10$ewqlk2zysNDd47IVB17TGe1fUqgS4yO7u/LpSG22V7UqrldUswOya	
-- 3c34b596-aec0-4e1d-88f4-4e7618e3b89b