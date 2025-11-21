// frontend/src/pages/HostProfile.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { List } from "lucide-react";

type Publication = {
  id?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  status?: string;
};

const HostProfile: React.FC = () => {
  const { user, isBusinessOwner } = useAuth();

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
  const publications: Publication[] = Array.isArray(publicationsFromUser) ? publicationsFromUser : [];
  const publicationsCount = (user as any).publicationsCount ?? (Array.isArray(publicationsFromUser) ? publicationsFromUser.length : Number(publicationsFromUser) || 0);
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
                  <div>
                    <div className="text-2xl font-bold text-primary">{reviewsCount}</div>
                    <div className="text-xs text-muted-foreground">Reseñas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{publicationsCount}</div>
                    <div className="text-xs text-muted-foreground">Publicaciones</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">{reservationsCount}</div>
                    <div className="text-xs text-muted-foreground">Reservaciones</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Mis publicaciones (sin consultar al backend) */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              Mis publicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {publications.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">No tienes publicaciones aún</div>
            ) : (
              <div className="space-y-3">
                {publications.map((pub) => (
                  <div key={pub.id ?? pub.title} className="p-4 rounded-lg border bg-card hover:shadow transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{pub.title ?? "Sin título"}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{pub.description ?? ""}</p>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div>{pub.status ?? "Publicado"}</div>
                        <div>{pub.createdAt ? new Date(pub.createdAt).toLocaleDateString() : ""}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HostProfile;
