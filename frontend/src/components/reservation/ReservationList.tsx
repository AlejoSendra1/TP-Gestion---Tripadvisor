// components/ReservationList.tsx
import React from "react";
import { useUserReservations } from "@/hooks/useUserReservations";
import { useOwnerReservations } from "@/hooks/useOwnerReservations";
import ReservationCard from "./ReservationCard";

type ReservationListProps = {
  isOwner?: boolean;
  publicationId?: string;
  reservations?: any[]; 
};

export const ReservationList: React.FC<ReservationListProps> = ({ 
  isOwner = false, 
  publicationId,
  reservations: externalReservations
}) => {
  // Usar el hook correspondiente según el contexto
  const userReservations = useUserReservations();
  const ownerReservations = useOwnerReservations(publicationId);

  const { 
    reservations, 
    isLoading, 
    error, 
    fetchReservations: fetchUserReservations 
  } = userReservations;

  const { 
    reservations: ownerReservationsData, 
    isLoading: isLoadingOwner, 
    error: errorOwner,
    fetchOwnerReservations 
  } = ownerReservations;

  // Seleccionar datos según el contexto
  const currentReservations = externalReservations 
    ? externalReservations 
    : (isOwner ? ownerReservationsData : reservations);
  const currentLoading = isOwner ? isLoadingOwner : isLoading;
  const currentError = isOwner ? errorOwner : error;
  const refetch = isOwner ? fetchOwnerReservations : fetchUserReservations;

  const handleReservationUpdate = () => {
    refetch().catch(() => {});
  };

  if (currentLoading) {
    return <div className="text-sm text-muted-foreground">Cargando reservas...</div>;
  }

  if (currentError) {
    return (
      <div className="text-sm text-destructive">
        Error cargando reservas: {String(currentError.message ?? currentError)}
      </div>
    );
  }

  if (!currentReservations || currentReservations.length === 0) {
    return <div className="text-sm text-muted-foreground">No hay reservas.</div>;
  }

  const items = currentReservations.slice().reverse();

  return (
    <div className="flex gap-3 overflow-x-auto py-2 w-full max-w-full" role="list">
      {items.map((reservation: any, idx: number) => (
        <ReservationCard
          key={reservation.id ?? reservation._id ?? `reservation-${idx}`}
          reservation={reservation}
          isOwner={isOwner}
          onReservationUpdate={handleReservationUpdate}
        />
      ))}
    </div>
  );
};

export default ReservationList;