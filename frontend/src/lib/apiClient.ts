// src/lib/apiClient.ts

import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:30002',
    timeout: 10000,
});

// ✅ IMPORTANTE: Debe ser sessionStorage (NO localStorage)
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('accessToken');
    
    // Debug temporal - remover después
    console.log('🔑 apiClient - Token:', token ? 'encontrado' : 'NO encontrado');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('🚫 Error 401 - Verificá el token');
        }
        return Promise.reject(error);
    }
);

export default apiClient;