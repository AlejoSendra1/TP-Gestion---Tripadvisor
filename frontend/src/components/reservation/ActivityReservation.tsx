import React from "react";
import { formatOnlyDate, formatTime } from "./dateHelper";

type ActivityReservationProps = {
  reservation: any;
  expanded?: boolean;
};

export const ActivityReservation: React.FC<ActivityReservationProps> = ({ 
  reservation, 
  expanded = false 
}) => {
  const dateTime = reservation.dateTime ?? reservation.startDateTime ?? reservation.start_datetime ?? reservation.reservation_datetime;
  const rawParticipants = reservation.participantCount ?? null;
  const participants = rawParticipants != null ? Number(rawParticipants) : null;
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
          <span>Hora actividad:</span>
          <span className="font-medium">{formatTime(dateTime)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Participantes:</span>
          <span className="font-medium">{participants ?? "-"}</span>
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