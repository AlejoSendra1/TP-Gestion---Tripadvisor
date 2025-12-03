# Trippy API - Colección Postman

Colección modular para testing de la API Trippy.

## 📁 Estructura de Archivos

1. **0-Variables.postman_environment.json** - Variables globales
2. **1-Auth-Travelers.postman_collection.json** - Registro y auth de travelers
3. **2-User-Profile.postman_collection.json** - Gestión de perfiles
4. **[FUTURO] 3-Hosts-Owners.postman_collection.json** - Registro de hosts
5. **[FUTURO] 4-Publications.postman_collection.json** - Publicaciones
6. **[FUTURO] 5-Reservations.postman_collection.json** - Reservas
7. **[FUTURO] 6-Reviews.postman_collection.json** - Reseñas

## 🚀 Cómo Usar

### Paso 1: Importar Variables
1. Abrir Postman
2. Click en "Import" → Seleccionar `0-Variables.postman_environment.json`
3. Activar el environment en el dropdown superior derecho

### Paso 2: Importar Colecciones
1. Importar `1-Auth-Travelers.postman_collection.json`
2. Importar `2-User-Profile.postman_collection.json`

### Paso 3: Ejecutar Flujo
1. **Registrar Travelers:** Ejecutar requests en "👤 Traveler Registration"
2. **Autenticar:** Ejecutar "Login Traveler 1" (se guarda token automáticamente)
3. **Gestionar Perfil:** Ejecutar requests en "👤 Profile Operations"

## 🔧 Variables Configuradas

- `base_url`: http://localhost:30002
- `traveler1_email`: juan.traveler@example.com
- `traveler1_password`: Password123!
- `traveler2_email`: maria.traveler@example.com
- `traveler2_password`: SecurePass456!
- `traveler3_email`: carlos.traveler@example.com
- `traveler3_password`: TravelPass789!
- `auth_token`: (se establece automáticamente al hacer login)
- `refresh_token`: (se establece automáticamente al hacer login)

## 📋 Endpoints Cubiertos

### Authentication & Users
- `POST /users` - Registrar nuevo usuario (TRAVELER/OWNER)
- `POST /sessions` - Login
- `PUT /sessions` - Refresh token

### User Profile
- `GET /users/profile` - Obtener perfil actual
- `PUT /users/profile` - Actualizar perfil
- `GET /sessions/me` - Obtener nombre del usuario
- `GET /sessions/profile` - Obtener perfil vía sessions

## 🎯 Flujo de Demo

1. Registrar 3 travelers diferentes
2. Autenticarse con uno de ellos
3. Ver el perfil (nivel 1, XP 0)
4. Actualizar información del perfil
5. Verificar cambios

## 🔄 Para Futuras Extensiones

Esta estructura modular permite agregar fácilmente:
- Colección para Hosts/BusinessOwners
- Colección para Publicaciones
- Colección para Reservas  
- Colección para Reseñas
- Colección para XP System (admin)