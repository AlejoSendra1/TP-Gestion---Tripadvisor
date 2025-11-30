-- Script para inicializar beneficios en la tienda
-- Ejecutar en tu base de datos PostgreSQL/MySQL

-- Limpiar tabla si existe (opcional, solo para desarrollo)
-- DELETE FROM benefits;

-- Beneficios de Descuento
INSERT INTO benefits (name, description, cost, type, discount_percentage, single_use) 
VALUES 
('Descuento 5%', 'Obtén un 5% de descuento en tu próxima reserva', 200, 'DISCOUNT', 5, true),
('Descuento 10%', 'Obtén un 10% de descuento en tu próxima reserva', 400, 'DISCOUNT', 10, true),
('Descuento 15%', 'Obtén un 15% de descuento en tu próxima reserva', 600, 'DISCOUNT', 15, true),
('Descuento 20%', 'Obtén un 20% de descuento en tu próxima reserva', 900, 'DISCOUNT', 20, true),
('Mega Descuento 25%', '¡Descuento especial del 25% en tu próxima reserva!', 1200, 'DISCOUNT', 25, true);

-- Beneficios de Bonus XP
INSERT INTO benefits (name, description, cost, type, xp_bonus, single_use) 
VALUES 
('Bonus XP +50', 'Gana 50 XP adicionales en tu próxima reserva', 150, 'XP_BONUS', 50, true),
('Bonus XP +100', 'Gana 100 XP adicionales en tu próxima reserva', 300, 'XP_BONUS', 100, true),
('Bonus XP +200', 'Gana 200 XP adicionales en tu próxima reserva', 550, 'XP_BONUS', 200, true),
('Super Bonus XP +500', '¡Gana 500 XP adicionales en tu próxima reserva!', 1000, 'XP_BONUS', 500, true);

-- Beneficios de Soporte Prioritario
INSERT INTO benefits (name, description, cost, type, single_use) 
VALUES 
('Soporte Prioritario 24h', 'Acceso a soporte prioritario durante 24 horas', 300, 'PRIORITY_SUPPORT', true),
('Soporte Prioritario Mensual', 'Acceso a soporte prioritario durante un mes', 800, 'PRIORITY_SUPPORT', true);

-- Beneficios de Upgrade Gratis
INSERT INTO benefits (name, description, cost, type, single_use) 
VALUES 
('Upgrade de Categoría', 'Upgrade gratuito a la siguiente categoría disponible', 500, 'FREE_UPGRADE', true),
('Upgrade Premium', 'Upgrade gratuito a categoría premium según disponibilidad', 1000, 'FREE_UPGRADE', true);

-- Verificar que se insertaron correctamente
SELECT * FROM benefits ORDER BY cost ASC;