// src/hooks/usePublicationDetail.ts

import { useQuery } from "@tanstack/react-query";
// Importamos tu apiClient, igual que en usePublications.ts
import { apiClient } from "@/lib/apiClient";

// --- 1. Definimos los Tipos de Datos (DTOs) ---
// Estos tipos son el "contrato" con tu API (PublicationDetailDTO.java)

export type LocationDTO = {
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
};

export type HostDTO = {
    id: number;
    name: string;
    email: string;
    photoUrl: string | null;
};

// Este es el 'ReviewDTO' de PublicationDetailDTO.java
export type ReviewDTO = {
    id: number;
    authorName: string;
    rating: number;
    comment: string;
};

// Este es el DTO principal
export type PublicationDetailDTO = {
    id: number;
    title: string;
    description: string;
    price: number;
    location: LocationDTO;
    host: HostDTO;
    imageUrls: string[];
    reviews: ReviewDTO[]; // El servicio los manda vacíos por ahora
    publicationType: string; // "HOTEL", "RESTAURANT", "ACTIVITY"

    // Usamos 'unknown' (la versión segura de 'any') como discutimos
    specificDetails: { [key: string]: unknown };
};

// --- 2. La Función de Fetching (privada del hook) ---
// Esta es la función que realmente llama a la API
const fetchPublicationDetail = async (experienceId: string | undefined) => {
    // Si no hay ID, no llames a la API
    if (!experienceId) {
        throw new Error("ID de experiencia no provisto");
    }

    // Usamos el endpoint de detalle
    // Axios/apiClient pondrá la data en 'response.data'
    const response = await apiClient.get<PublicationDetailDTO>(`/publications/${experienceId}`);

    return response.data;
};


// --- 3. El Hook Personalizado (lo que exportamos) ---
export const usePublicationDetail = (id: string | undefined) => {

    // El hook "envuelve" la llamada a useQuery
    return useQuery({

        // queryKey: Una llave única para esta consulta.
        // react-query la usa para cachear los datos.
        queryKey: ["experience", id],

        // queryFn: La función que se ejecutará para buscar los datos
        queryFn: ({ queryKey }) => {
            // Leemos el ID desde la queryKey para más seguridad
            const [_key, expId] = queryKey;
            return fetchPublicationDetail(expId as string | undefined);
        },

        // enabled: No ejecutar la consulta hasta que 'id'
        // tenga un valor real (evita llamadas con 'undefined')
        enabled: !!id,
    });
};