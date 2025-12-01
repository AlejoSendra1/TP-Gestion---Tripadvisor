import React from "react";
import { formatOnlyDate, formatTime } from "./dateHelper";

type RestaurantReservationProps = {
  reservation: any;
  expanded?: boolean;
};

export const RestaurantReservation: React.FC<RestaurantReservationProps> = ({ 
  reservation, 
  expanded = false 
}) => {
  const dateTime = reservation.dateTime ?? reservation.reservation_datetime ?? reservation.startDateTime ?? reservation.start_datetime;
  const guests = reservation.guestCount ?? reservation.guest_count ?? reservation.guests ?? null;
  const creationDate = reservation.reservationDate;

  if (!expanded) {
    return (
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Fecha</div>
        <div className="font-medium">{formatOnlyDate(dateTime) ?? "-"}</div>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t pt-3 space-y-2 text-sm text-muted-foreground min-w-0 w-full">
      <div>
        <div className="text-xs text-muted-foreground">Fecha de creación</div>
        <div className="font-medium">{formatOnlyDate(creationDate) ?? "-"}</div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Hora reserva:</span>
          <span className="font-medium">{formatTime(dateTime)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Invitados:</span>
          <span className="font-medium">{guests ?? "-"}</span>
        </div>
      </div>

      {reservation.notes && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Notas</div>
          <div className="font-medium whitespace-pre-wrap break-words">
            {reservation.notes}
          </div>
        </div>
      )}
    </div>
  );
};