import React from "react";
import { formatOnlyDate } from "./dateHelper";

type CoworkingReservationProps = {
  reservation: any;
  expanded?: boolean;
};

export const CoworkingReservation: React.FC<CoworkingReservationProps> = ({ 
  reservation, 
  expanded = false 
}) => {
  const start = reservation.startDate ?? reservation.start_date ?? reservation.checkIn;
  const end = reservation.endDate ?? reservation.end_date ?? reservation.checkOut;
  const people = reservation.guestCount ?? reservation.guest_count ?? reservation.people ?? null;
  const creationDate = reservation.reservationDate;

  if (!expanded) {
    return (
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Fecha</div>
        <div className="font-medium flex items-center gap-2">
          <span>{formatOnlyDate(start) ?? "-"}</span>
          <span>→</span>
          <span>{formatOnlyDate(end) ?? "-"}</span>
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
          <span>Inicio:</span>
          <span className="font-medium">{formatOnlyDate(start) ?? "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Fin:</span>
          <span className="font-medium">{formatOnlyDate(end) ?? "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Personas:</span>
          <span className="font-medium">{people ?? "-"}</span>
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