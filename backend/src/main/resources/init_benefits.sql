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