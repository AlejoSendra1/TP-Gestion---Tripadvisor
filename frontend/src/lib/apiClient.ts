// src/lib/apiClient.ts

import axios from 'axios';

// 1. Creamos la instancia de Axios
export const apiClient = axios.create({
    // 2. Definimos la URL base de tu backend
    // baseURL: '/api/v1',
    timeout: 10000, // (Opcional) 10 segundos antes de fallar
});

// 3. (Futuro) Aquí es donde agregarías los "interceptors"
// para poner el token de autenticación (JWT) en todas
// las peticiones automáticamente.
//
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });