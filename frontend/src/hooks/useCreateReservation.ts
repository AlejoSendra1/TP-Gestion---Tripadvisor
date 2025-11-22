import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/hooks/use-auth'; // ✅ NUEVO IMPORT

type ReservationInput = {
  publicationId: number | string;
  startDate: string;
  endDate: string;
  guests: number;
  additionalInfo?: string;
  token?: string | null;
};

export function useCreateReservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { refreshUser } = useAuth(); // ✅ OBTENER refreshUser

  async function createReservation(input: ReservationInput) {
    setIsLoading(true);
    setError(null);
    try {
      const { publicationId, token, ...body } = input;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await apiClient.post(`/publications/${publicationId}/reservations`, body, config);
      
      // ✅ NUEVO: Refrescar usuario para actualizar XP y nivel
      console.log("🔄 Refrescando datos del usuario después de reserva...");
      await refreshUser();
      console.log("✅ Usuario refrescado - XP actualizado");
      
      return res.data;
    } catch (err: any) {
      const errObj: any = { raw: err };
      if (err?.response) {
        errObj.status = err.response.status;
        errObj.message =
          err.response.data?.message ||
          err.response.data?.error ||
          (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) ||
          err.message;
      } else {
        errObj.message = err.message;
      }
      setError(errObj);
      throw errObj;
    } finally {
      setIsLoading(false);
    }
  }

  return { createReservation, isLoading, error };
}