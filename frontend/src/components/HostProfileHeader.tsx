// File: frontend/src/components/HostProfileHeader.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  name: string;
  email: string;
  avatar: string;
  publicationsCount: number;
  displayedReservationsCount: number;
  displayedReviewsCount: number;
}

const HostProfileHeader: React.FC<Props> = ({
  name,
  email,
  avatar,
  publicationsCount,
  displayedReservationsCount,
  displayedReviewsCount
}) => {
  const initials = (name && name[0]) ? name[0].toUpperCase() : "U";

  return (
    <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
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
              <h1 className="text-3xl font-bold text-foreground">{name || "Nombre no disponible"}</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{publicationsCount}</div>
              <div className="text-sm text-muted-foreground">Publicaciones</div>
            </div>

            <div className="space-y-1 p-4 rounded-lg">
              <div className="text-2xl font-bold text-accent">{displayedReservationsCount}</div>
              <div className="text-sm text-muted-foreground">Reservas</div>
            </div>

            <div className="space-y-1 p-4 rounded-lg">
              <div className="text-2xl font-bold text-amber-500">{displayedReviewsCount}</div>
              <div className="text-sm text-muted-foreground">Reseñas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HostProfileHeader;
