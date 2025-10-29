// src/hooks/usePublications.ts

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from 'axios';

// El tipo (sin cambios)
export type PublicationSummary = {
    id: string;
    title: string;
    price: number;
    city: string;
    country: string;
    mainImageUrl: string;
    publicationType: string;
};

// La función de fetching (afuera)
const fetchPublications = async (): Promise<PublicationSummary[]> => {
    const response = await apiClient.get<PublicationSummary[]>("/publications");
    console.log("Respuesta de la API:", response.data); // Tu log
    return response.data;
};

// El hook usando useQuery
export const usePublications = () => {

    // El 'data', 'isLoading' y 'error' te los da useQuery
    const { data, isLoading, error } = useQuery<PublicationSummary[], AxiosError>({
        // Esta es la "llave" que se invalida
        queryKey: ["publications"],

        // La función que se ejecutará
        queryFn: fetchPublications,
    });

    // Devolvemos los datos con los mismos nombres que antes
    return { publications: data ?? [], isLoading, error };
};