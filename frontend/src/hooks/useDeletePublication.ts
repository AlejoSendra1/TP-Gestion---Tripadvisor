// src/hooks/useDeletePublication.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

// 1. La función que llama a la API (DELETE)
// Recibe el ID de la publicación a borrar
const deletePublication = async (publicationId: string) => {
    // Tu apiClient ya inyecta el token, ¡perfecto!
    const response = await apiClient.delete(`/publications/${publicationId}`);
    return response.data;
};

// 2. El hook que usa useMutation
export const useDeletePublication = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    // 3. Obtenemos el cliente de query para invalidar cachés
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePublication, // La función que se ejecutará

        // 4. ¡Magia! Se ejecuta si el borrado fue exitoso
        onSuccess: (data, publicationId) => {
            toast({
                title: "Publicación Eliminada",
                description: "Tu publicación ha sido eliminada correctamente.",
            });

            // 5. Invalidamos las cachés
            // Refresca la lista de la home page
            queryClient.invalidateQueries({ queryKey: ["publications"] });
            // Limpia el caché de esta página de detalle
            queryClient.removeQueries({ queryKey: ["experience", publicationId] });

            // 6. Redirigimos al inicio
            navigate("/");
        },

        // 7. Se ejecuta si la API devuelve un error (403, 404, 500, etc.)
        onError: (error: AxiosError<{ message: string }>) => {
            const errorMessage = error.response?.data?.message || error.message || "Ocurrió un error.";
            toast({
                title: "Error al eliminar",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });
};