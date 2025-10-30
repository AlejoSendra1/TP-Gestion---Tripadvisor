// src/hooks/usePublications.ts

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from 'axios';
import { SearchFilters } from "@/components/SearchFilters";

export interface SearchFilters {
  query?: string;
}

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
const fetchPublications = async (filters: SearchFilters): Promise<PublicationSummary[]> => {
    
    const hasFilters = Object.values(filters).some(value => value && value.trim() !== '');
    
    
    if (!hasFilters) {
        // Sin filtros: usar endpoint simple
        const response = await apiClient.get<PublicationSummary[]>("/publications");
        console.log("Respuesta de la API (todas las publicaciones):", response.data);
        return response.data;
    } else {
        // Con filtros: usar endpoint de búsqueda con parámetros
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `/publications/search?${queryParams.toString()}`;
        const response = await apiClient.get<PublicationSummary[]>(url);
        console.log("Respuesta de la API (búsqueda filtrada):", response.data);
        return response.data;
    }
};

// El hook usando useQuery
export const usePublications = (filters: SearchFilters) => {

    // El 'data', 'isLoading' y 'error' te los da useQuery
    const { data, isLoading, error } = useQuery<PublicationSummary[], AxiosError>({
        queryKey: ["publications", filters],
        queryFn: () => fetchPublications(filters),
    });

    // Devolvemos los datos con los mismos nombres que antes
    return { publications: data ?? [], isLoading, error };
};