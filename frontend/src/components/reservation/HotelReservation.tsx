import React from "react";
import { formatOnlyDate } from "./dateHelper";

type HotelReservationProps = {
  reservation: any;
  expanded?: boolean;
};

export const HotelReservation: React.FC<HotelReservationProps> = ({ 
  reservation, 
  expanded = false 
}) => {
  const checkIn = reservation.checkIn ?? reservation.check_in ?? reservation.start_date ?? reservation.startDate;
  const checkOut = reservation.checkOut ?? reservation.check_out ?? reservation.end_date ?? reservation.endDate;
  const rooms = reservation.roomCount ?? reservation.room_count ?? reservation.rooms ?? null;
  const creationDate = reservation.reservationDate;

  if (!expanded) {
    return (
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Fecha</div>
        <div className="font-medium flex items-center gap-2">
          <span>{formatOnlyDate(checkIn) ?? "-"}</span>
          <span>→</span>
          <span>{formatOnlyDate(checkOut) ?? "-"}</span>
        </div>
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
          <span>Check-in:</span>
          <span className="font-medium">{formatOnlyDate(checkIn) ?? "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Check-out:</span>
          <span className="font-medium">{formatOnlyDate(checkOut) ?? "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Habitaciones:</span>
          <span className="font-medium">{rooms ?? "-"}</span>
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