import React from "react";
import { Badge } from "@/components/ui/badge";
import { getReservationType, getEventColor } from "./ReservationHelper";

type ReservationHeaderProps = {
  reservation: any;
  isOwner: boolean;
};

const getTypeBadgeVariant = (type: string) => {
  switch (type.toLowerCase()) {
    case "hotel":
      return "default";
    case "actividad":
      return "secondary";
    case "restaurante":
      return "destructive";
    case "coworking":
      return "outline";
    default:
      return "default";
  }
};

const getUserName = (r: any): string => {
  return r.travelerName || "Cliente";
};

const getPublicationName = (r: any): string => {
  return r.pubName || "Publicación";
};

export const ReservationHeader: React.FC<ReservationHeaderProps> = ({ 
  reservation, 
  isOwner 
}) => {
  const reservationType = getReservationType(reservation);
  const displayName = isOwner ? getUserName(reservation) : getPublicationName(reservation);
  const displayLabel = isOwner ? "Cliente" : "Publicación";
  const backgroundColor = getEventColor(reservation.reservationType ?? reservation.type ?? reservation.reservation_type ?? "");

  return (
    <div className="mb-3 flex justify-between items-start">
      <div>
        <div className="text-xs text-muted-foreground">{displayLabel}</div>
        <div className="font-medium text-base">{displayName}</div>
      </div>
      <Badge 
        className="text-white font-medium"
        style={{ 
          backgroundColor: backgroundColor,
          borderColor: backgroundColor
        }}
      >
        {reservationType}
      </Badge>
    </div>
  );
};