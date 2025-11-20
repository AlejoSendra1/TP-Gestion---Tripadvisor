// frontend/src/pages/HostProfile.tsx
import React from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8 flex items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold text-foreground">{name || "Nombre no disponible"}</h1>
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HostProfile;
