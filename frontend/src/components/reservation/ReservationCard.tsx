import React, { useState } from "react";
import { ReservationHeader } from "./ReservationHeader";
import { ReservationStatus } from "./ReservationStatus";
import { ReservationActions } from "./ReservationActions";
import { 
  HotelReservation, 
  ActivityReservation, 
  RestaurantReservation, 
  CoworkingReservation 
} from "./reservation-types";
import { getReservationType } from "./ReservationHelper";

type ReservationCardProps = {
  reservation: any;
  isOwner?: boolean;
  onReservationUpdate?: () => void;
};

export const ReservationCard: React.FC<ReservationCardProps> = ({ 
  reservation, 
  isOwner = false,
  onReservationUpdate 
}) => {
  const [expanded, setExpanded] = useState(false);

  const getReservationContent = () => {
    const type = getReservationType(reservation);
    
    switch (type) {
      case "Hotel":
        return <HotelReservation reservation={reservation} />;
      case "Actividad":
        return <ActivityReservation reservation={reservation} />;
      case "Restaurante":
        return <RestaurantReservation reservation={reservation} />;
      case "Coworking":
        return <CoworkingReservation reservation={reservation} />;
      default:
        return (
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Fecha</div>
            <div className="font-medium">-</div>
          </div>
        );
    }
  };

  const getExpandedContent = () => {
    const type = getReservationType(reservation);
    
    switch (type) {
      case "Hotel":
        return <HotelReservation reservation={reservation} expanded />;
      case "Actividad":
        return <ActivityReservation reservation={reservation} expanded />;
      case "Restaurante":
        return <RestaurantReservation reservation={reservation} expanded />;
      case "Coworking":
        return <CoworkingReservation reservation={reservation} expanded />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 border rounded-md bg-card flex-shrink-0 w-80 transition-all">
      <ReservationHeader reservation={reservation} isOwner={isOwner} />
      
      <div className="flex items-start justify-between mb-2">
        {getReservationContent()}
        <ReservationStatus 
          reservation={reservation} 
          isOwner={isOwner} 
          onReservationUpdate={onReservationUpdate}
        />
      </div>

      <ReservationActions 
        reservation={reservation} 
        expanded={expanded}
        onToggleExpanded={() => setExpanded(!expanded)}
      />

      {expanded && getExpandedContent()}
    </div>
  );
};

export default ReservationCard;