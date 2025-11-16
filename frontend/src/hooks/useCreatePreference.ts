// frontend/src/hooks/useCreatePreference.ts
import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';

// Lo que esperamos que devuelva el backend
type PreferenceResponse = {
    preferenceId: string;
    initPointUrl: string;
};

type PreferenceError = {
    message: string;
    status?: number;
};

export function useCreatePreference() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<PreferenceError | null>(null);

    async function createPreference(reservationId: number | string) {
        setIsLoading(true);
        setError(null);
        try {
            // El interceptor de apiClient se encarga del token
            const res = await apiClient.post<PreferenceResponse>(
                '/api/payments/create-preference',
                { reservationId } // El DTO que espera el backend
            );
            return res.data; // Devuelve { preferenceId, initPointUrl }
        } catch (err: any) {
            const errObj: PreferenceError = {
                message: 'Error al crear la preferencia de pago.',
            };
            if (err?.response) {
                errObj.status = err.response.status;
                errObj.message =
                    err.response.data?.message ||
                    err.response.data?.error || // Agregamos .error
                    (typeof err.response.data === 'string' // Agregamos el check de string
                        ? err.response.data
                        : JSON.stringify(err.response.data)) || // Stringify como último recurso
                    err.message || // Usamos err.message si todo lo demás falla
                    'Error del servidor';
            }
            setError(errObj);
            throw errObj;
        } finally {
            setIsLoading(false);
        }
    }

    return { createPreference, isLoading, error };
}