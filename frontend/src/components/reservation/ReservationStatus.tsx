import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Loader2 } from "lucide-react";
import { useDeleteReservation } from "@/hooks/useDeleteReservation";

type ReservationStatusProps = {
  reservation: any;
  isOwner: boolean;
  onReservationUpdate?: () => void;
};

const mapStatus = (s: any) => {
  if (!s) return null;
  const up = String(s).toUpperCase();
  if (up === "CONFIRMED") return "CONFIRMADO";
  if (up === "CANCELLED") return "CANCELADO";
  if (up === "COMPLETED") return "COMPLETADO";
  return up;
};

const getStatusColor = (status: string | null) => {
  if (!status) return "text-gray-600";
  
  const statusUpper = status.toUpperCase();
  if (statusUpper === "CONFIRMADO") return "text-green-600 font-semibold";
  if (statusUpper === "CANCELADO") return "text-red-600 font-semibold";
  if (statusUpper === "COMPLETADO") return "text-blue-600 font-semibold";
  return "text-gray-600";
};

export const ReservationStatus: React.FC<ReservationStatusProps> = ({ 
  reservation, 
  isOwner,
  onReservationUpdate 
}) => {
  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation();
  
  const status = mapStatus(reservation.status ?? reservation.statusName ?? reservation.state);
  const price = reservation.totalPrice ?? null;
  const priceDisplay = price == null ? "-" : typeof price === "number" ? `$${price}` : String(price);

  const id = reservation.id ?? reservation._id ?? null;
  const key = id != null ? String(id) : `reservation-${Date.now()}`;

  const canDelete = status === "CONFIRMADO" && !isOwner;

  const handleDeleteReservation = (reservationId: string, publicationId: string) => {
    deleteReservation(
      { reservationId, publicationId: String(publicationId) },
      {
        onSuccess: () => {
          onReservationUpdate?.();
        }
      }
    );
  };

  return (
    <div className="flex items-start gap-2">
      <div className="text-right flex flex-col items-end">
        <div className="text-xs text-muted-foreground">Estado</div>
        <div className={`font-medium ${getStatusColor(status)}`}>{status ?? "-"}</div>
        <div className="text-xs text-muted-foreground mt-1">Precio</div>
        <div className="font-medium text-sm">{priceDisplay}</div>
      </div>
      
      {!isOwner && canDelete && (
        <div className="flex items-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteReservation(key, reservation.publicationId)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar reserva
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};