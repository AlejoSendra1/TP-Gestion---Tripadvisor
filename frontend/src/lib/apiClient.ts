// language: typescript
// src/lib/apiClient.ts

import axios from 'axios';

// 1. Lee la variable de entorno VITE_API_BASE_URL (que pusiste en Vercel).
//    Si no existe (porque estás en local), usa '/' como base
//    para que el proxy de vite.config.ts funcione.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

// 2. Creamos la instancia de Axios con la URL base correcta
export const apiClient = axios.create({
    baseURL: API_BASE_URL, // <-- ¡Lógica de Vercel!
    timeout: 10000,
});

// 3. Interceptor de Petición (Request)
// (Lee el token antes de CADA llamada)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['ngrok-skip-browser-warning'] = 'true';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 4. Interceptor de Respuesta (Response)
// (Maneja los tokens expirados)
apiClient.interceptors.response.use(
    (response) => {
        // Si la respuesta es exitosa (2xx), solo la devolvemos.
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 (Unauthorized) Y no es un reintento.
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Marcamos para no entrar en un bucle infinito.

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                // Si no hay refresh token, no podemos hacer nada.
                // Limpiamos localStorage y redirigimos al login.
                localStorage.removeItem('userData');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Intentamos obtener un nuevo token usando el refreshToken.
                // Llamamos al endpoint PUT /sessions
                // (Usamos la instancia de apiClient, que ya tiene la baseURL correcta)
                const response = await apiClient.put('/sessions', { refreshToken });

                // El backend nos da los nuevos tokens.
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Guardamos los nuevos tokens en localStorage.
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Actualizamos el header de la petición original.
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // Reintentamos la petición original (ej. /api/payments...)
                return apiClient(originalRequest);

            } catch (refreshError) {
                // ¡El refresh token falló! (está vencido o es inválido).
                // Limpiamos todo y forzamos el logout.
                localStorage.removeItem('userData');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Si no es un error 401, simplemente devolvemos el error.
        return Promise.reject(error);
    }
);