import { useState, useEffect } from 'react';
import axios from 'axios';

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
      const response = await axios.get(`/ia/reviews/summary/${publicationId}`);
      setSummaryText(response.data.summary || response.data.summaryText || response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
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