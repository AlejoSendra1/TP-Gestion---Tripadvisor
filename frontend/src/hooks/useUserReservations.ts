import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/hooks/use-auth';

export function useUserReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  async function fetchReservations(token?: string | null, signal?: AbortSignal) {
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

      // Llamada al endpoint del backend, no deberia usar el env sino apiClient directamente
      // pero lo dejo asi porque sino siempre me tira index.html y nose porque...
      // TODO: revisar esto despues... (sino imposible avanzar...)
      const res = await apiClient.get(import.meta.env.VITE_BACKEND_API_URL + "/reservations/me", config);
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
    if (!user) {
      setReservations([]);
      return;
    }

    const controller = new AbortController();

    const defaultToken =
      (user as any)?.token ??
      (user as any)?.accessToken ??
      (user as any)?.access_token ??
      null;

    fetchReservations(defaultToken, controller.signal).catch(() => {
      // errores ya manejados en fetchReservations
    });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { fetchReservations, reservations, isLoading, error, setReservations };
}
