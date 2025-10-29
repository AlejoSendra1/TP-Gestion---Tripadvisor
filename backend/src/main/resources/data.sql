INSERT INTO users (id, email, password, agree_to_terms, user_type)
VALUES (100, 'hotel@paradise.com', 'hashed_password_789', TRUE, 'OWNER');

INSERT INTO business_owners (id, business_name, business_type, business_description, verified)
VALUES (
    100,
    'Paradise resorts',
    'Accommodation',
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
    cuisine_type, price_range, opening_hours, menu_url
) VALUES (
             2, 'RESTAURANT', 'Restaurante La Paella', 'Auténtica comida...', 45.50, 100, 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
             'Av. de Mayo 567', 'Buenos Aires', 'CABA', 'Argentina', '1084',
             'Española', '$$$', '12:00 - 00:00', '...'
         );

-- 3. Actividad (ID 3)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    duration_in_hours, meeting_point, what_is_included, activity_level, language
) VALUES (
             3, 'ACTIVITY', 'Tour de Grafitis...', 'Recorre las calles...', 25.00, 100, 'https://turismo.buenosaires.gob.ar/sites/turismo/files/field/image/ElRegreso980.jpg',
             'Honduras y Serrano', 'Buenos Aires', 'CABA', 'Argentina', '1414',
             3, 'Esquina...', 'Guía...', 'Bajo', 'Español/Inglés'
         );

-- 4. Coworking (ID 4)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    price_per_day, price_per_month
) VALUES (
             4, 'COWORKING', 'Trippy WorkSpace', 'Oficina compartida...', 30.00, 100, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
             'Av. Vélez Sarsfield 800', 'Córdoba', 'Córdoba', 'Argentina', '5000',
             30.00, 450.00
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

/*

INSERT INTO users (id, email, password, agree_to_terms, user_type)
VALUES (2001, 'maria.garcia@example.com', 'hashed_password_456', TRUE, 'TRAVELER');

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

-- Asumimos que la tabla se llama 'review'
INSERT INTO review (id, publication_id, user_id, rating, comment, created_at)
VALUES
    (1, 1, 201, 5, '¡Increíble! La pileta es hermosa y la atención 10/10.', '2025-10-20 14:30:00'),
    (2, 1, 202, 4, 'Muy buen hotel, la habitación era cómoda. El desayuno podría mejorar.', '2025-10-21 09:15:00');
*/

-- ACTUALIZA EL CONTADOR DE IDS
-- Le dice a la secuencia que el próximo ID que debe generar es MAX(id) + 1
SELECT setval('publication_id_seq', (SELECT MAX(id) FROM publication));