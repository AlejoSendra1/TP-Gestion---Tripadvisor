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
type Props = {
  reservations: any[];
  onDeleteReservation?: (reservationId: string, publicationId: string) => void;
  deletingReservationId?: string | null;
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
  // Prioridad: fecha de la reserva (checkIn, dateTime, etc.)
  if (r.checkIn) return formatOnlyDate(r.checkIn);
  if (r.dateTime) return formatOnlyDate(r.dateTime);
  if (r.startDate) return formatOnlyDate(r.startDate);
  if (r.start_date) return formatOnlyDate(r.start_date);
  if (r.reservation_datetime) return formatOnlyDate(r.reservation_datetime);
  
  // Si no hay fecha específica de la reserva, usar la fecha de creación
  return formatOnlyDate(r.reservationDate);
};

const getCreationDate = (r: any) => {
  return formatOnlyDate(r.reservationDate);
};

export const ReservationList: React.FC<Props> = ({ 
  reservations, 
  onDeleteReservation, 
  deletingReservationId 
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleDetails = (id: any) => {
    if (id == null) return;
    const key = String(id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDeleteReservation = (reservationId: string, publicationId: string) => {
    if (onDeleteReservation) {
      onDeleteReservation(reservationId, publicationId);
    }
  };

  if (!reservations || reservations.length === 0) {
    return <div className="text-sm text-muted-foreground">No hay reservas.</div>;
  }

  const items = reservations.slice().reverse();

  return (
    <div className="flex gap-3 overflow-x-auto py-2 w-full max-w-full" role="list">
      {items.map((r: any, idx: number) => {
        const reservationDate = getReservationDate(r);
        const creationDate = getCreationDate(r);
        const price = r.totalPrice ?? null;
        const priceDisplay = price == null ? "-" : typeof price === "number" ? `$${price}` : String(price);

        const notes = r.notes ?? r.note ?? null;
        const status = mapStatus(r.status ?? r.statusName ?? r.state);

        const id = r.id ?? r._id ?? null;
        const key = id != null ? String(id) : `idx-${idx}`;
        const isExpanded = key != null && expandedIds.has(key);

        const type = String(
          r.reservationType ?? r.type ?? r.reservation_type ?? r.class ?? ""
        ).toLowerCase();

        const publicationHref = getPublicationHref(r);
        const isExternal = typeof publicationHref === "string" && /^https?:\/\//.test(publicationHref);
        const canDelete = status === "CONFIRMADO" && onDeleteReservation;

        return (
          <div
            key={key}
            role="listitem"
            className={`p-4 border rounded-md bg-card flex-shrink-0 w-80 transition-all`}
          >
            {/* --- CABECERA MODIFICADA --- */}
            <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs text-muted-foreground">Fecha de creación</div>
                            <div className="font-medium">{creationDate ?? "-"}</div>
                          </div>

              {/* --- ESTADO Y DROPDOWN JUNTOS --- */}
              <div className="flex items-start gap-2">
                                <div className="text-right flex flex-col items-end">
                                  <div className="text-xs text-muted-foreground">Estado</div>
                                  <div className={`font-medium ${getStatusColor(status)}`}>{status ?? "-"}</div>
                                </div>
                
                {/* DROPDOWN MENU AL LADO DEL ESTADO */}
                {(canDelete || onDeleteReservation) && (
                      <div className="flex items-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0" // sin mt-4
                              disabled={deletingReservationId === key}
                            >
                              {deletingReservationId === key ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteReservation(key, r.publicationId)}
                                disabled={deletingReservationId === key}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancelar reserva
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
              </div>
            </div>

            {/* Precio en la tarjeta principal */}
            <div className="mt-2">
              <div className="text-xs text-muted-foreground">Precio</div>
              <div className="font-medium">{priceDisplay}</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleDetails(id)}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? "Ocultar detalles" : "Detalles"}
                </Button>
              </div>

              {/* Botón naranja del mismo tamaño para 'Ver publicación' */}
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

            {isExpanded && (
              <div className="mt-3 border-t pt-3 space-y-2 text-sm text-muted-foreground min-w-0 w-full">
                {/* --- DETALLES EXPANDIDOS --- */}

                {/* Información específica por tipo de reserva */}
                {(() => {
                  const typeStr = type ?? "";

                  if (typeStr.includes("hotel") || typeStr.includes("reservationhotel") || r.checkIn || r.check_in) {
                    const checkIn = r.checkIn ?? r.check_in ?? r.start_date ?? r.startDate;
                    const checkOut = r.checkOut ?? r.check_out ?? r.end_date ?? r.endDate;
                    const rooms = r.roomCount ?? r.room_count ?? r.rooms ?? null;
                    return (
                      <div className="space-y-2">
                        <div>Check-in: <span className="font-medium">{formatOnlyDate(checkIn) ?? "-"}</span></div>
                        <div>Check-out: <span className="font-medium">{formatOnlyDate(checkOut) ?? "-"}</span></div>
                        <div>Habitaciones: <span className="font-medium">{rooms ?? "-"}</span></div>
                      </div>
                    );
                  }

                  if (typeStr.includes("activity") || typeStr.includes("reservationactivity") || r.participantCount) {
                                      const dateTime = r.dateTime ?? r.startDateTime ?? r.start_datetime ?? r.reservation_datetime;
                                      const rawParticipants = r.participantCount ?? null;
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

                  if (typeStr.includes("restaurant") || typeStr.includes("reservationrestaurant") || r.dateTime || r.reservation_datetime) {
                    const dateTime = r.dateTime ?? r.reservation_datetime ?? r.startDateTime ?? r.start_datetime;
                    const guests = r.guestCount ?? r.guest_count ?? r.guests ?? null;
                    return (
                      <div className="space-y-2">
                        <div>Fecha reserva: <span className="font-medium">{formatDate(dateTime)}</span></div>
                        <div>Hora: <span className="font-medium">{formatTime(dateTime)}</span></div>
                        <div>Invitados: <span className="font-medium">{guests ?? "-"}</span></div>
                      </div>
                    );
                  }

                  if (typeStr.includes("cowork") || typeStr.includes("coworking") || r.start_date || r.end_date || r.startDate || r.endDate) {
                    const start = r.startDate ?? r.start_date ?? r.checkIn;
                    const end = r.endDate ?? r.end_date ?? r.checkOut;
                    const people = r.guestCount ?? r.guest_count ?? r.people ?? null;
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
                      <div>Fecha / Hora: <span className="font-medium">{formatDate(r.dateTime ?? r.reservation_datetime) ?? "-"}</span></div>
                      <div>Personas / Invitados: <span className="font-medium">{r.guestCount ?? r.guest_count ?? "-"}</span></div>
                    </div>
                  );
                })()}

                {/* Notas al final de Detalles */}
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
      })}
    </div>
  );
};

export default ReservationList;