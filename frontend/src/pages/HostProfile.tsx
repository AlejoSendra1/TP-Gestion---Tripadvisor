// File: `frontend/src/pages/HostProfile.tsx`
import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/apiClient";
import { PublicationSummary } from "@/hooks/usePublications";
import HostProfileHeader from "@/components/HostProfileHeader";
import PublicationsCarousel from "@/components/PublicationsCarousel";
import useReviewCounts from "@/hooks/useReviewCounts";
import useReservationsCounts from "@/hooks/useReservationsCounts";
import HostPerformance from "@/components/HostPerformance";

const mapToSummary = (item: any): PublicationSummary => ({
  id: item.id?.toString() ?? "",
  title: item.title ?? "",
  mainImageUrl: item.mainImageUrl ?? item.image ?? "",
  price: typeof item.price === "number" ? item.price : Number(item.price ?? 0),
  city: item.city ?? (item.location?.city ?? "") ?? "",
  country: item.country ?? (item.location?.country ?? "") ?? "",
  publicationType: item.publicationType ?? item.publication_type ?? item.type ?? ""
});

const HostProfile: React.FC = () => {
  const { user, isBusinessOwner } = useAuth();
  const [fetchedPublications, setFetchedPublications] = useState<PublicationSummary[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);

  const {
    reviewsCounts,
    loading: loadingReviewsCount,
    fetchReviewCountsForPublications
  } = useReviewCounts();

  const {
    reservationsCountsByPub,
    loading: loadingReservationsCount,
    fetchReservationsCountsForPublications
  } = useReservationsCounts();

  async function fetchPubs(token?: string | null, signal?: AbortSignal) {
    setLoadingPubs(true);
    setPubsError(null);
    try {
      const defaultToken =
        (user as any)?.token ?? (user as any)?.accessToken ?? (user as any)?.access_token ?? null;
      const authToken = token ?? defaultToken;
      const config: any = {};
      if (authToken) config.headers = { Authorization: `Bearer ${authToken}` };
      if (signal) config.signal = signal;

      const res = await apiClient.get("/publications/mine", config);
      const raw = Array.isArray(res.data) ? res.data : [];
      const data = raw.map(mapToSummary).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
      setFetchedPublications(data);

      const ids = data.map(d => d.id).filter(id => id);
      if (ids.length > 0) {
        const auth = authToken;
        fetchReviewCountsForPublications(ids, auth, signal).catch(() => {});
        fetchReservationsCountsForPublications(ids, auth, signal).catch(() => {});
      } else {
        // reset if no pubs
      }
      return data;
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled" || err?.name === "AbortError") return;
      const errObj: any = { raw: err };
      if (err?.response) {
        errObj.status = err.response.status;
        errObj.message =
          err.response.data?.message ||
          err.response.data?.error ||
          (typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data)) ||
          err.message;
      } else {
        errObj.message = err.message;
      }
      setPubsError(errObj.message || "Error al cargar publicaciones");
      throw errObj;
    } finally {
      setLoadingPubs(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setFetchedPublications([]);
      return;
    }
    const controller = new AbortController();
    const defaultToken =
      (user as any)?.token ?? (user as any)?.accessToken ?? (user as any)?.access_token ?? null;
    fetchPubs(defaultToken, controller.signal).catch(() => {});
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalReviewsCount = Object.values(reviewsCounts).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const displayedReviewsCount = !loadingReviewsCount ? totalReviewsCount : (user as any).reviewsCount ?? 0;

  const totalReservationsCount = Object.values(reservationsCountsByPub).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const fallbackReservationsCount = (user as any).reservationsCount ?? (user as any).reservations ?? 0;
  const displayedReservationsCount = !loadingReservationsCount ? totalReservationsCount : fallbackReservationsCount;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No has iniciado sesión</p>
        </div>
      </div>
    );
  }

  const name = isBusinessOwner()
    ? (user as any).businessName ?? `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim()
    : `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim();

  const email = (user as any).email ?? "Sin email";
  const avatar = (user as any).avatarUrl ?? (user as any).photo ?? "/placeholder-avatar.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-6">
        <HostProfileHeader
          name={name}
          email={email}
          avatar={avatar}
          publicationsCount={!loadingPubs ? fetchedPublications.length : (user as any).publicationsCount ?? 0}
          displayedReservationsCount={displayedReservationsCount}
          displayedReviewsCount={displayedReviewsCount}
        />

        <PublicationsCarousel
          fetchedPublications={fetchedPublications}
          loadingPubs={loadingPubs}
          pubsError={pubsError}
        />

        <HostPerformance />
      </main>
    </div>
  );
};

export default HostProfile;