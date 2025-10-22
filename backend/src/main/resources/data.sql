-- Host (Usuario) de prueba
INSERT INTO users (id, name, lastname, email, password, role)
VALUES (100, 'Host', 'de Prueba', 'host@trippy.com', 'password-hash', 'HOST')
ON CONFLICT (id) DO NOTHING;

-- --- MOCKS DE PUBLICACIONES ---

-- 1. Hotel (Quitamos ON CONFLICT, innecesario con create-drop)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    room_count, capacity
) VALUES (
             1, 'HOTEL', 'Gran Hotel Trippy', 'El mejor hotel...', 150.00, 100, '...',
             'Av. Colón 1234', 'Mar del Plata', 'Buenos Aires', 'Argentina', '7600',
             50, 120
         );

-- 2. Restaurante (Quitamos ON CONFLICT)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    cuisine_type, price_range, opening_hours, menu_url
) VALUES (
             2, 'RESTAURANT', 'Restaurante La Paella', 'Auténtica comida...', 45.50, 100, '...',
             'Av. de Mayo 567', 'Buenos Aires', 'CABA', 'Argentina', '1084',
             'Española', '$$$', '12:00 - 00:00', '...'
         );

-- 3. Actividad (Quitamos ON CONFLICT)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    duration_in_hours, meeting_point, what_is_included, activity_level, language
) VALUES (
             3, 'ACTIVITY', 'Tour de Grafitis...', 'Recorre las calles...', 25.00, 100, '...',
             'Honduras y Serrano', 'Buenos Aires', 'CABA', 'Argentina', '1414',
             3, 'Esquina...', 'Guía...', 'Bajo', 'Español/Inglés'
         );

-- 4. Coworking (Quitamos ON CONFLICT)
INSERT INTO publication (
    id, tipo_publicacion, title, description, price, host_user_id, main_image_url,
    street_address, city, state, country, zip_code,
    price_per_day, price_per_month
) VALUES (
             4, 'COWORKING', 'Trippy WorkSpace', 'Oficina compartida...', 30.00, 100, '...',
             'Av. Vélez Sarsfield 800', 'Córdoba', 'Córdoba', 'Argentina', '5000',
             30.00, 450.00
         );

-- Servicios de Coworking (¡Quitamos ON CONFLICT!)
INSERT INTO coworking_services (publication_id, service)
VALUES
    (4, 'WiFi Alta Velocidad'),
    (4, 'Café Ilimitado'),
    (4, 'Salas de Reunión'),
    (4, 'Impresora'); -- <-- Simplemente terminamos con punto y coma