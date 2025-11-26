// language: typescript
// src/lib/apiClient.ts

import axios from 'axios';

// 1. Lee la variable de entorno VITE_API_BASE_URL (que pusiste en Vercel).
//    Si no existe (porque estás en local), usa '/' como base
//    para que el proxy de vite.config.ts funcione.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:30002';

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


// export const apiClient = axios.create({
//     baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:30002',
//     timeout: 10000,
// });

// // ✅ IMPORTANTE: Debe ser sessionStorage (NO localStorage)
// apiClient.interceptors.request.use((config) => {
//     const token = sessionStorage.getItem('accessToken');
    
//     // Debug temporal - remover después
//     console.log('🔑 apiClient - Token:', token ? 'encontrado' : 'NO encontrado');
    
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// // Interceptor para manejar errores 401
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             console.error('🚫 Error 401 - Verificá el token');
//         }
//         return Promise.reject(error);
//     }
// );

// ... imports y configuración inicial igual ...

// 4. Interceptor de Respuesta (CORREGIDO)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // --- PARCHE ANTI-BUCLE ---
        // Si el error viene de intentar hacer login o refresh (/sessions),
        // NO intentamos refrescar de nuevo. Dejamos que falle.
        if (originalRequest.url.includes('/sessions') || originalRequest.url.includes('/login')) {
            return Promise.reject(error);
        }
        // -------------------------

        // Si el error es 401 (Unauthorized) Y no es un reintento.
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken'); //

            if (!refreshToken) {
                // Logout forzoso
                localStorage.removeItem('userData');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Llamamos al refresh
                const response = await apiClient.put('/sessions', { refreshToken });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                return apiClient(originalRequest);

            } catch (refreshError) {
                // Si falla el refresh, logout forzoso
                localStorage.removeItem('userData');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
