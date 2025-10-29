import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

// El tipo de publicación
type PublicationType = "hotel" | "activity" | "coworking" | "restaurant";

/**
 * Esta es la función principal de la mutación.
 * Se encarga de separar los datos y llamar a los dos endpoints en orden.
 */
const editPublicationFn = async ({
                                     id,
                                     publicationType,
                                     formData,
                                 }: {
    id: string;
    publicationType: PublicationType;
    formData: any;
}) => {
    // 1. Definir Endpoints
    const commonEndpoint = `/publications/${id}`;
    const specificEndpoint = `/publications/${publicationType}/${id}`;

    // 2. Separar datos comunes
    const baseData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(String(formData.price)),
        location: formData.location,
        mainImageUrl: formData.mainImageUrl,
        imageUrls: formData.imageUrls ?? [],
    };

    // 3. Separar datos específicos (¡AHORA COMPLETOS!)
    let specificData = {};

    if (publicationType === "hotel") {
        specificData = {
            roomCount: parseInt(String(formData.roomCount), 10) || null,
            capacity: parseInt(String(formData.capacity), 10) || null,
        };
    } else if (publicationType === "activity") {
        // ✅ --- LÓGICA DE ACTIVITY AÑADIDA ---
        specificData = {
            durationInHours: parseInt(String(formData.durationInHours), 10) || null,
            meetingPoint: formData.meetingPoint,
            whatIsIncluded: formData.whatIsIncluded,
            activityLevel: formData.activityLevel,
            language: formData.language,
        };
    } else if (publicationType === "coworking") {
        // ✅ --- LÓGICA DE COWORKING AÑADIDA ---
        // Manejamos el string de "servicios" separado por comas
        const servicesArray = Array.isArray(formData.services)
            ? formData.services
            : (formData.services || "").split(",").map((s: string) => s.trim());

        specificData = {
            pricePerDay: parseFloat(String(formData.pricePerDay)) || null,
            pricePerMonth: parseFloat(String(formData.pricePerMonth)) || null,
            services: servicesArray,
        };
    } else if (publicationType === "restaurant") {
        // ✅ --- LÓGICA DE RESTAURANT AÑADIDA ---
        specificData = {
            cuisineType: formData.cuisineType,
            priceRange: formData.priceRange,
            openingHours: formData.openingHours,
            menuUrl: formData.menuUrl,
        };
    }

    // 4. Ejecutar las peticiones EN ORDEN (para evitar race conditions)
    await apiClient.patch(commonEndpoint, baseData);
    await apiClient.patch(specificEndpoint, specificData);
};

/**
 * El Hook de React Query
 */
export const useEditPublication = (
    id: string,
    publicationType: PublicationType
) => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // Para invalidar la caché

    return useMutation({
        // La función que se ejecutará al llamar a 'mutate'
        mutationFn: (formData: any) =>
            editPublicationFn({ id, publicationType, formData }),

        // Al tener éxito...
        onSuccess: () => {
            toast({
                title: "Publicación actualizada",
                description: "Los cambios fueron guardados correctamente.",
            });

            // Invalidamos la caché para que los datos se refresquen solos
            // en la lista principal y en la página de detalles.
            queryClient.invalidateQueries({ queryKey: ["publications"] });
            queryClient.invalidateQueries({ queryKey: ["publication", id] });

            // Navegamos de vuelta al detalle
            navigate(`/experience/${id}`);
        },

        // Al fallar...
        onError: (err) => {
            const error = err as Error | AxiosError;
            console.error("Error al actualizar:", error.message);
            let description = "Ocurrió un error inesperado.";
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403)
                    description = "No tienes permisos para editar.";
                if (error.response?.status === 404)
                    description = "Publicación no encontrada.";
            }
            toast({ title: "Error al guardar", description, variant: "destructive" });
        },
    });
};