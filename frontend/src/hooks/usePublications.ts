// src/hooks/usePublications.ts

import { useState, useEffect } from "react";
// 1. Importamos nuestro 'apiClient' personalizado
import { apiClient } from "@/lib/apiClient";
// 2. Importamos el tipo de error de Axios para mejor manejo
import axios, { AxiosError } from 'axios';

// 3. Definimos el TIPO de dato
// Este es el "espejo" exacto de tu DTO 'PublicationListDTO.java'
export type PublicationSummary = {
    id: string; // Es 'Long' en Java, pero en TS/JS lo manejamos como string
    title: string;
    price: number; // Es 'double' en Java
    city: string;
    country: string;
    mainImageUrl: string;
    publicationType: string;
};

// 4. Creamos el hook
export const usePublications = () => {

    // 5. Estados para manejar los datos, la carga y el error
    const [publications, setPublications] = useState<PublicationSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // 6. El 'useEffect' se ejecuta una vez cuando el componente se monta
    useEffect(() => {
        // 7. Definimos la función asíncrona para traer los datos
        const fetchPublications = async () => {
            try {
                // 8. ¡LA LLAMADA A LA API!
                // Usamos apiClient.get() y solo ponemos el final del endpoint.
                // Axios espera recibir un array de 'PublicationSummary'
                const response = await apiClient.get<PublicationSummary[]>("/publications");
                console.log("Respuesta de la API:", response.data);
                // 9. Axios pone la data en 'response.data' (ya parseada de JSON)
                setPublications(response.data);

            } catch (err) {
                // 10. Manejo de errores (¡Axios entra aquí con errores 4xx/5xx!)
                const error = err as Error | AxiosError;
                if (axios.isAxiosError(error)) {
                    // Si es un error de Axios, usamos su mensaje
                    console.error("Error de Axios:", error.response?.data || error.message);
                    setError(new Error(error.message));
                } else {
                    // Si es un error genérico
                    setError(error);
                }
            } finally {
                // 11. Pase lo que pase, dejamos de cargar
                setIsLoading(false);
            }
        };

        fetchPublications(); // Llamamos a la función
    }, []); // El array vacío asegura que solo se ejecute una vez

    // 12. El hook devuelve el estado para que la página lo use
    return { publications, isLoading, error };
};