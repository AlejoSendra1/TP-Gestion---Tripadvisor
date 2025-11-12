// src/lib/apiClient.ts

import axios from 'axios';

// 1. Creamos la instancia de Axios
export const apiClient = axios.create({
    // baseURL: '/api/v1', // (Asegúrate que tu proxy de Vite maneje esto)
    timeout: 10000,
});

// 2. --- ¡LA SOLUCIÓN! ---
// Descomentamos el interceptor de peticiones
apiClient.interceptors.request.use((config) => {
    // 3. Leemos el token que guardamos en AuthContext
    const token = localStorage.getItem('accessToken');
    if (token) {
        // 4. Si existe, lo ponemos en la cabecera 'Authorization'
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});