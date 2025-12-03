import { useState, useEffect } from 'react';
import { apiClient } from "@/lib/apiClient"; // Importamos tu cliente configurado
import { AxiosError } from 'axios'; // Importamos el tipo de error para el catch

interface UseReviewSummaryReturn {
  summaryText: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReviewSummary(publicationId: string | undefined): UseReviewSummaryReturn {
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!publicationId) {
      setSummaryText(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Usamos apiClient en lugar de axios
      const response = await apiClient.get(`/ia/reviews/summary/${publicationId}`);

      // Ajustamos para tomar la data correctamente según venga del back
      setSummaryText(response.data.summary || response.data.summaryText || response.data);

    } catch (err) {
      console.error("Error fetching summary:", err); // Log para debug

      if (err instanceof AxiosError) {
        // Manejo de error específico de Axios
        setError(err.response?.data?.message || err.message || 'Failed to fetch summary');
      } else {
        setError('Failed to fetch summary');
      }
      setSummaryText(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [publicationId]);

  return {
    summaryText,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}