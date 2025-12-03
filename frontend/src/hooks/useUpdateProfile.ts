// src/hooks/useUpdateProfile.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from 'axios';

// --- ¡NUEVO IMPORTE! ---
// Importamos useAuth para acceder al 'user' actual en el contexto
import { useAuth } from '@/hooks/use-auth';

// Este es el DTO de entrada que creamos en el backend
type UpdateProfileRequest = {
    firstName: string;
    lastName: string;
};

// DTO de respuesta (el UserProfileDTO del backend)
// Asegurémonos que coincida con lo que devuelve el backend
type UserProfileResponse = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    levelInfo: any; // Ajustar si es necesario
    trippyCoins: number;
    // ...y todos los otros campos de UserProfileDTO
};

type ErrorResponse = {
    message: string;
};

// 1. La función que llama a la API (PUT)
const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>("/users/profile", data);
    return response.data;
};

// 2. El hook que usa useMutation
export const useUpdateProfile = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // --- ¡NUEVO! ---
    // Obtenemos el objeto 'user' actual del AuthContext
    // Esto nos da la estructura que está guardada en localStorage
    const { user } = useAuth();

    return useMutation({
        mutationFn: updateProfile,

        // 3. Al tener éxito...
        onSuccess: (updatedProfile) => { // 'updatedProfile' es la respuesta de la API
            toast({
                title: '✅ Perfil Actualizado',
                description: 'Tus cambios han sido guardados.',
            });

            // --- ¡ESTA ES LA SOLUCIÓN! ---

            // 1. Creamos el nuevo objeto de usuario para el localStorage
            // Usamos el 'user' actual del contexto y solo sobrescribimos los campos que cambiaron
            const updatedUserData = {
                ...user, // Mantiene email, userXP, userLevel, role, etc.
                firstName: updatedProfile.firstName, // Actualiza el nombre
                lastName: updatedProfile.lastName   // Actualiza el apellido
            };

            // 2. Actualizamos el localStorage ANTES de recargar
            // (AuthContext.jsx lee "userData")
            localStorage.setItem("userData", JSON.stringify(updatedUserData));

            // 3. Forzamos la recarga de la página
            // Ahora, cuando AuthContext se recargue, leerá los datos correctos
            window.location.href = '/profile';
        },

        // 4. Al fallar...
        onError: (error: AxiosError<ErrorResponse>) => {
            console.error('❌ Error al actualizar el perfil:', error);

            let title = "Error al guardar";
            let description = "Ocurrió un error inesperado.";

            if (error.response) {
                const status = error.response.status;
                if (status === 403) {
                    title = "Acceso denegado";
                    description = "No tienes permisos para esta acción.";
                } else if (status === 401) {
                    title = "No autorizado";
                    description = "Tu sesión ha expirado. Vuelve a iniciar sesión.";
                } else if (status === 400) {
                    description = error.response.data?.message || "Los datos enviados son inválidos.";
                } else if (status === 500) {
                    description = "Error interno del servidor.";
                }
            } else if (error.request) {
                description = "No se pudo conectar con el servidor.";
            }

            toast({
                title: title,
                description: description,
                variant: "destructive",
            });
        },
    });
};