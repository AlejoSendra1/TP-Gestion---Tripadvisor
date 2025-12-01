// hooks/useOwnerReservations.ts
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/hooks/use-auth';

export function useOwnerReservations(publicationId?: string) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  async function fetchOwnerReservations(token?: string | null, signal?: AbortSignal) {
    if (!publicationId) {
      setReservations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const defaultToken =
        (user as any)?.token ??
        (user as any)?.accessToken ??
        (user as any)?.access_token ??
        null;

      const authToken = token ?? defaultToken;
      const config: any = {};

      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }
      if (signal) {
        config.signal = signal;
      }

      // Usar el endpoint correcto del backend
      const res = await apiClient.get(
        `${import.meta.env.VITE_BACKEND_API_URL}/publications/${publicationId}/reservations/all`,
        config
      );
      
      const data = Array.isArray(res.data) ? res.data : [];
      setReservations(data);
      return data;
    } catch (err: any) {
      // Ignorar cancelaciones
      if (
        err?.name === 'CanceledError' ||
        err?.message === 'canceled' ||
        err?.name === 'AbortError'
      ) {
        return;
      }

      const errObj: any = { raw: err };
      if (err?.response) {
        errObj.status = err.response.status;
        errObj.message =
          err.response.data?.message ||
          err.response.data?.error ||
          (typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)) ||
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

  useEffect(() => {
    if (!user || !publicationId) {
      setReservations([]);
      return;
    }

    const controller = new AbortController();

    const defaultToken =
      (user as any)?.token ??
      (user as any)?.accessToken ??
      (user as any)?.access_token ??
      null;

    fetchOwnerReservations(defaultToken, controller.signal).catch(() => {
      // errores ya manejados en fetchOwnerReservations
    });

    return () => controller.abort();
  }, [user, publicationId]);

  return { 
    fetchOwnerReservations, 
    reservations, 
    isLoading, 
    error, 
    setReservations 
  };
}