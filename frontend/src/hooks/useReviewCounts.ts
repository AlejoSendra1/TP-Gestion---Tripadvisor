// File: `frontend/src/hooks/useReviewCounts.ts`
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";

export default function useReviewCounts() {
  const [reviewsCounts, setReviewsCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReviewCountsForPublications(ids: string[], token?: string | null, signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const defaultToken = token ?? null;
      const headers: any = {};
      if (defaultToken) headers.Authorization = `Bearer ${defaultToken}`;

      const promises = ids.map(id =>
        apiClient.get(`/reviews/publication/${id}`, {
          params: { page: 0, size: 1 },
          headers,
          signal,
        })
      );

      const results = await Promise.all(promises);
      const counts: Record<string, number> = {};
      results.forEach((r, idx) => {
        const id = ids[idx];
        const total = (r?.data?.totalElements ?? 0);
        counts[id] = typeof total === "number" ? total : Number(total || 0);
      });

      setReviewsCounts(counts);
      return counts;
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled" || err?.name === "AbortError") return;
      setError("Error al cargar contadores de reseñas");
      return {};
    } finally {
      setLoading(false);
    }
  }

  return { reviewsCounts, loading, error, fetchReviewCountsForPublications };
}