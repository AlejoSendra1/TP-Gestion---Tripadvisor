// typescript
import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';

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

  async function createReservation(input: ReservationInput) {
    setIsLoading(true);
    setError(null);
    try {
      const { publicationId, token, ...body } = input;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await apiClient.post(`/publications/${publicationId}/reservations`, body, config);
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
