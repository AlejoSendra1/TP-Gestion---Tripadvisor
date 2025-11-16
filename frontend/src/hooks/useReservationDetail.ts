// frontend/src/hooks/useReservationDetail.ts
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

// --- ¡¡ESTA INTERFAZ ESTÁ MODIFICADA!! ---
// Ahora es plana, igual que tu DTO de Java
export interface ReservationDetail {
    id: number;
    startDate: string | null;
    endDate: string | null;
    dateTime: string | null;
    guests: number;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

    // Campos aplanados (en lugar de anidados)
    publicationId: number;
    publicationTitle: string;
    publicationMainImageUrl: string;
    travelerEmail: string;
}

export function useReservationDetail(reservationId: string | undefined) {
    const [reservation, setReservation] = useState<ReservationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (!reservationId) return;

        const controller = new AbortController();
        async function fetchReservation() {
            setIsLoading(true);
            setError(null);
            try {
                const res = await apiClient.get<ReservationDetail>( // <-- Usamos la nueva interfaz
                    `/reservations/${reservationId}`,
                    {
                        signal: controller.signal,
                    }
                );
                setReservation(res.data);
            } catch (err: any) {
                if (err?.name === 'CanceledError' || err?.message === 'canceled') return;
                setError(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchReservation();

        return () => controller.abort();
    }, [reservationId]);

    return { reservation, isLoading, error };
}