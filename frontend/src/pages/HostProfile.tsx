// typescript
import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { List } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { ExperienceCard } from "@/components/ExperienceCard";
import { Skeleton } from "@/components/ui/skeleton"; // para skeletons similares
import { PublicationSummary } from "@/hooks/usePublications";

const HostProfile: React.FC = () => {
  const { user, isBusinessOwner } = useAuth();
  const [fetchedPublications, setFetchedPublications] = useState<PublicationSummary[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);

  const mapToSummary = (item: any): PublicationSummary => {
    return {
      id: item.id?.toString() ?? "",
      title: item.title ?? "",
      mainImageUrl: item.mainImageUrl ?? item.image ?? "",
      price: typeof item.price === "number" ? item.price : Number(item.price ?? 0),
      city: item.city ?? (item.location?.city ?? "") ?? "",
      country: item.country ?? (item.location?.country ?? "") ?? "",
      publicationType: item.publicationType ?? item.publication_type ?? item.type ?? ""
    };
  };

  async function fetchPubs(token?: string | null, signal?: AbortSignal) {
    setLoadingPubs(true);
    setPubsError(null);

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

      const url = "/publications/mine";
      const res = await apiClient.get(url, config);
      const raw = Array.isArray(res.data) ? res.data : [];
      const data = raw
              .map(mapToSummary)
              .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
      setFetchedPublications(data);
      return data;
    } catch (err: any) {
      if (
        err?.name === "CanceledError" ||
        err?.message === "canceled" ||
        err?.name === "AbortError"
      ) {
        return;
      }

      const errObj: any = { raw: err };
      if (err?.response) {
        errObj.status = err.response.status;
        errObj.message =
          err.response.data?.message ||
          err.response.data?.error ||
          (typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data)) ||
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
      (user as any)?.token ??
      (user as any)?.accessToken ??
      (user as any)?.access_token ??
      null;

    fetchPubs(defaultToken, controller.signal).catch(() => {
      // errores ya manejados en fetchPubs
    });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const initials = (() => {
    if (isBusinessOwner()) {
      return (name && name[0]) ? name[0].toUpperCase() : "B";
    }
    const fn = (user as any).firstName ?? "";
    const ln = (user as any).lastName ?? "";
    return ((fn[0] ?? "") + (ln[0] ?? "")).toUpperCase() || "U";
  })();

  const reviewsCount = (user as any).reviewsCount ?? 0;
  const publicationsFromUser = (user as any).publications ?? (user as any).myPublications ?? [];
  // Nuevo: preferir el conteo real desde el backend cuando ya terminó la carga.
  const publicationsCount = !loadingPubs
    ? fetchedPublications.length
    : (user as any).publicationsCount ?? (Array.isArray(publicationsFromUser) ? publicationsFromUser.length : Number(publicationsFromUser) || 0);
  const reservationsCount = (user as any).reservationsCount ?? (user as any).reservations ?? 0;

  return (
      <div className="min-h-screen bg-background">
            <Header />
            <main className="container py-8 space-y-6">
              <Card className="max-w-3xl mx-auto">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center lg:text-left space-y-2">
                      <div className="flex items-center justify-center lg:justify-start gap-2">
                        <h1 className="text-2xl font-bold text-foreground">{name || "Nombre no disponible"}</h1>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{email}</p>

                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{publicationsCount}</div>
                    <div className="text-sm text-muted-foreground mt-1">Publicaciones</div>
                  </div>

                  <div className="p-4 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{reservationsCount}</div>
                    <div className="text-sm text-muted-foreground mt-1">Reservas</div>
                  </div>

                  <div className="p-4 rounded-lg">
                    <div className="text-2xl font-bold text-amber-500">{reviewsCount}</div>
                    <div className="text-sm text-muted-foreground mt-1">Reseñas</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Mis publicaciones (ampliada) */}
        <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <List className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>Mis publicaciones</CardTitle>
                    </div>
                  </CardHeader>

          <CardContent className="p-6">
            {loadingPubs && (
              <div className="py-4">
                <div className="flex space-x-6 overflow-x-auto px-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="min-w-[300px] flex-shrink-0">
                      <Skeleton className="h-56 w-full rounded-xl" />
                      <div className="mt-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pubsError && (
              <div className="text-destructive text-center py-6">Error: {pubsError}</div>
            )}

            {!loadingPubs && !pubsError && fetchedPublications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">Aún no tiene publicaciones</p>
              </div>
            ) : (
              !loadingPubs && !pubsError && (
                <div className="py-4">
                  <div className="flex space-x-6 overflow-x-auto px-2">
                    {fetchedPublications.map((pub) => (
                      <div key={pub.id} className="min-w-[300px] flex-shrink-0">
                        <ExperienceCard
                          id={pub.id}
                          title={pub.title}
                          image={pub.mainImageUrl}
                          location={`${pub.city}, ${pub.country}`}
                          price={`$${pub.price}`}
                          category={pub.publicationType}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HostProfile;
