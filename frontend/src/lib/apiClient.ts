// src/lib/apiClient.ts
import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// --- LÓGICA DE BLOQUEO PARA REFRESH TOKEN ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 1. Interceptor de Request
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

// 2. Interceptor de Response (CORREGIDO)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Evitar bucles en login o refresh
        if (originalRequest.url.includes('/sessions') || originalRequest.url.includes('/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {

            // SI YA SE ESTÁ REFRESANDO: Ponemos la petición en cola
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // SI NO SE ESTÁ REFRESANDO: Iniciamos el proceso
            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                handleLogout();
                return Promise.reject(error);
            }

            try {
                const response = await apiClient.put('/sessions', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Procesamos la cola de peticiones que estaban esperando
                processQueue(null, accessToken);

                // Reintentamos la petición original
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                handleLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
};

export default apiClient;