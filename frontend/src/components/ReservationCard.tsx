import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Loader2 } from "lucide-react";
import { useDeleteReservation } from "@/hooks/useDeleteReservation";

type ReservationCardProps = {
  reservation: any;
  isOwner?: boolean;
  onReservationUpdate?: () => void;
};

const parseDate = (v: string | number | null | undefined) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const mapStatus = (s: any) => {
  if (!s) return null;
  const up = String(s).toUpperCase();
  if (up === "CONFIRMED") return "CONFIRMADO";
  if (up === "CANCELLED") return "CANCELADO";
  if (up === "COMPLETED") return "COMPLETADO";
  return up;
};

const formatOnlyDate = (v: string | number | null | undefined) => {
  if (!v) return null;
  try {
    const d = typeof v === "string" ? new Date(v) : new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(v);
  }
};

const formatDate = (v: string | number | null | undefined) => {
  const d = parseDate(v);
  if (!d) return "-";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (v: string | number | null | undefined) => {
  const d = parseDate(v);
  if (!d) return "-";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getPublicationHref = (r: any): string | null => {
  if (!r) return null;
  return `/experience/${String(r.publicationId)}`;
};

const getStatusColor = (status: string | null) => {
  if (!status) return "text-gray-600";
  
  const statusUpper = status.toUpperCase();
  if (statusUpper === "CONFIRMADO") return "text-green-600 font-semibold";
  if (statusUpper === "CANCELADO") return "text-red-600 font-semibold";
  if (statusUpper === "COMPLETADO") return "text-blue-600 font-semibold";
  return "text-gray-600";
};

const getReservationDate = (r: any) => {
  if (r.checkIn) return formatOnlyDate(r.checkIn);
  if (r.dateTime) return formatOnlyDate(r.dateTime);
  if (r.startDate) return formatOnlyDate(r.startDate);
  if (r.start_date) return formatOnlyDate(r.start_date);
  if (r.reservation_datetime) return formatOnlyDate(r.reservation_datetime);
  return formatOnlyDate(r.reservationDate);
};

const getCreationDate = (r: any) => {
  return formatOnlyDate(r.reservationDate);
};

const getUserName = (r: any): string => {
  return r.travelerName || "Cliente";
};

const getPublicationName = (r: any): string => {
  return r.pubName || "Publicación";
};

export const ReservationCard: React.FC<ReservationCardProps> = ({ 
  reservation, 
  isOwner = false,
  onReservationUpdate 
}) => {
    const [expanded, setExpanded] = useState(false);
    const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation();
    
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

  const reservationDate = getReservationDate(reservation);
  const creationDate = getCreationDate(reservation);
  const price = reservation.totalPrice ?? null;
  const priceDisplay = price == null ? "-" : typeof price === "number" ? `$${price}` : String(price);

  const notes = reservation.notes ?? reservation.note ?? null;
  const status = mapStatus(reservation.status ?? reservation.statusName ?? reservation.state);

  const id = reservation.id ?? reservation._id ?? null;
  const key = id != null ? String(id) : `reservation-${Date.now()}`;

  const type = String(
    reservation.reservationType ?? reservation.type ?? reservation.reservation_type ?? reservation.class ?? ""
  ).toLowerCase();

  const publicationHref = getPublicationHref(reservation);
  const isExternal = typeof publicationHref === "string" && /^https?:\/\//.test(publicationHref);
  
  // Lógica de permisos: solo se puede cancelar si está confirmado
  const canDelete = status === "CONFIRMADO" && !isOwner; // Los owners no pueden cancelar, solo los usuarios

  const displayName = isOwner ? getUserName(reservation) : getPublicationName(reservation);
  const displayLabel = isOwner ? "Cliente" : "Publicación";

  return (
    <div
      key={key}
      className="p-4 border rounded-md bg-card flex-shrink-0 w-80 transition-all"
    >
      {/* PRIMERA LÍNEA: Nombre del cliente o publicación */}
      <div className="mb-3">
        <div className="text-xs text-muted-foreground">{displayLabel}</div>
        <div className="font-medium text-base">{displayName}</div>
      </div>
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs text-muted-foreground">
            {isOwner ? "Reserva de usuario" : "Fecha de creación"}
          </div>
          <div className="font-medium">{creationDate ?? "-"}</div>
        </div>

        <div className="flex items-start gap-2">
          <div className="text-right flex flex-col items-end">
            <div className="text-xs text-muted-foreground">Estado</div>
            <div className={`font-medium ${getStatusColor(status)}`}>{status ?? "-"}</div>
          </div>
          
          {/* Dropdown solo si no es owner y puede eliminar */}
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
      </div>

      {/* Precio */}
      <div className="mt-2">
        <div className="text-xs text-muted-foreground">Precio</div>
        <div className="font-medium">{priceDisplay}</div>
      </div>

      {/* Botones */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? "Ocultar detalles" : "Detalles"}
          </Button>
        </div>

        {/* Botón para ver publicación */}
        <div>
          {publicationHref ? (
            isExternal ? (
              <Button size="sm" variant="ghost" asChild className="!text-orange-500">
                <a
                  href={publicationHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                >
                  Ver publicación
                </a>
              </Button>
            ) : (
              <Button size="sm" variant="ghost" asChild className="!text-orange-500">
                <Link to={publicationHref} className="text-sm underline">
                  Ver publicación
                </Link>
              </Button>
            )
          ) : (
            <div className="text-xs text-muted-foreground">Sin publicación</div>
          )}
        </div>
      </div>

      {/* Detalles expandidos */}
      {expanded && (
        <div className="mt-3 border-t pt-3 space-y-2 text-sm text-muted-foreground min-w-0 w-full">
          {/* Información específica por tipo de reserva */}
          {(() => {
            const typeStr = type ?? "";

            if (typeStr.includes("hotel") || typeStr.includes("reservationhotel") || reservation.checkIn || reservation.check_in) {
              const checkIn = reservation.checkIn ?? reservation.check_in ?? reservation.start_date ?? reservation.startDate;
              const checkOut = reservation.checkOut ?? reservation.check_out ?? reservation.end_date ?? reservation.endDate;
              const rooms = reservation.roomCount ?? reservation.room_count ?? reservation.rooms ?? null;
              return (
                <div className="space-y-2">
                  <div>Check-in: <span className="font-medium">{formatOnlyDate(checkIn) ?? "-"}</span></div>
                  <div>Check-out: <span className="font-medium">{formatOnlyDate(checkOut) ?? "-"}</span></div>
                  <div>Habitaciones: <span className="font-medium">{rooms ?? "-"}</span></div>
                </div>
              );
            }

            if (typeStr.includes("activity") || typeStr.includes("reservationactivity") || reservation.participantCount) {
              const dateTime = reservation.dateTime ?? reservation.startDateTime ?? reservation.start_datetime ?? reservation.reservation_datetime;
              const rawParticipants = reservation.participantCount ?? null;
              const participants = (() => {
                if (rawParticipants == null) return null;
                const n = typeof rawParticipants === "string" ? parseInt(rawParticipants, 10) : Number(rawParticipants);
                return Number.isNaN(n) ? null : n;
              })();

              return (
                <div className="space-y-2">
                  <div>Fecha actividad: <span className="font-medium">{formatOnlyDate(dateTime) ?? "-"}</span></div>
                  <div>Participantes: <span className="font-medium">{participants ?? "-"}</span></div>
                </div>
              );
            }

            if (typeStr.includes("restaurant") || typeStr.includes("reservationrestaurant") || reservation.dateTime || reservation.reservation_datetime) {
              const dateTime = reservation.dateTime ?? reservation.reservation_datetime ?? reservation.startDateTime ?? reservation.start_datetime;
              const guests = reservation.guestCount ?? reservation.guest_count ?? reservation.guests ?? null;
              return (
                <div className="space-y-2">
                  <div>Fecha reserva: <span className="font-medium">{formatDate(dateTime)}</span></div>
                  <div>Hora: <span className="font-medium">{formatTime(dateTime)}</span></div>
                  <div>Invitados: <span className="font-medium">{guests ?? "-"}</span></div>
                </div>
              );
            }

            if (typeStr.includes("cowork") || typeStr.includes("coworking") || reservation.start_date || reservation.end_date || reservation.startDate || reservation.endDate) {
              const start = reservation.startDate ?? reservation.start_date ?? reservation.checkIn;
              const end = reservation.endDate ?? reservation.end_date ?? reservation.checkOut;
              const people = reservation.guestCount ?? reservation.guest_count ?? reservation.people ?? null;
              return (
                <div className="space-y-2">
                  <div>Inicio: <span className="font-medium">{formatOnlyDate(start) ?? "-"}</span></div>
                  <div>Fin: <span className="font-medium">{formatOnlyDate(end) ?? "-"}</span></div>
                  <div>Personas: <span className="font-medium">{people ?? "-"}</span></div>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                <div>Fecha / Hora: <span className="font-medium">{formatDate(reservation.dateTime ?? reservation.reservation_datetime) ?? "-"}</span></div>
                <div>Personas / Invitados: <span className="font-medium">{reservation.guestCount ?? reservation.guest_count ?? "-"}</span></div>
              </div>
            );
          })()}

          {/* Notas */}
          {notes && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Notas</div>
              <div
                className="mt-1 min-w-0 w-full max-w-full whitespace-pre-wrap break-words overflow-hidden"
                style={{ wordBreak: "break-all", overflowWrap: "anywhere" }}
              >
                <div className="font-medium">{notes}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCard;