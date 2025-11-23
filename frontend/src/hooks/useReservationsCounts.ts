// File: `frontend/src/hooks/useReservationsCounts.ts`
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";

export default function useReservationsCounts() {
  const [reservationsCountsByPub, setReservationsCountsByPub] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReservationsCountsForPublications(ids: string[], token?: string | null, signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const defaultToken = token ?? null;
      const headers: any = {};
      if (defaultToken) headers.Authorization = `Bearer ${defaultToken}`;

      const promises = ids.map(id =>
        apiClient.get(`/publications/${id}/reservations/all`, {
          headers,
          signal,
        })
      );

      const results = await Promise.all(promises);
      const counts: Record<string, number> = {};
      results.forEach((r, idx) => {
        const id = ids[idx];
        const data = r?.data ?? [];
        counts[id] = Array.isArray(data) ? data.length : Number(data || 0);
      });

      setReservationsCountsByPub(counts);
      return counts;
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled" || err?.name === "AbortError") return;
      setError("Error al cargar contadores de reservas");
      return {};
    } finally {
      setLoading(false);
    }
  }

  return { reservationsCountsByPub, loading, error, fetchReservationsCountsForPublications };
}
