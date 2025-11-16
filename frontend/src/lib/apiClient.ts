// language: typescript
// src/lib/apiClient.ts

import axios from 'axios';

// 1. Creamos la instancia de Axios
export const apiClient = axios.create({
    // baseURL: '/api/v1', // (El proxy de Vite se encarga de esto)
    timeout: 10000,
});

// 2. Interceptor de Petición (Request)
// (Este ya lo tenías, lee el token antes de CADA llamada)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- ¡¡NUEVA SECCIÓN: Interceptor de Respuesta (Response)!! ---
apiClient.interceptors.response.use(
    (response) => {
        // 1. Si la respuesta es exitosa (2xx), solo la devolvemos.
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 2. Si el error es 401 (Unauthorized) Y no es un reintento.
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
                // 3. Intentamos obtener un nuevo token usando el refreshToken.
                // Llamamos al endpoint PUT /sessions
                const response = await apiClient.put('/sessions', { refreshToken });

                // 4. El backend nos da los nuevos tokens.
                // Tu backend devuelve un TokenDTO
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // 5. Guardamos los nuevos tokens en localStorage.
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // 6. Actualizamos el header de la petición original.
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // 7. Reintentamos la petición original (ej. /api/payments...)
                return apiClient(originalRequest);

            } catch (refreshError) {
                // 8. ¡El refresh token falló! (está vencido o es inválido).
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
// --- FIN DE LA NUEVA SECCIÓN ---