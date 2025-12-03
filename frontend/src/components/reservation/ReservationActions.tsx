import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom"; // Importar useNavigate
import { CreditCard } from "lucide-react"; // Importar icono

type ReservationActionsProps = {
    reservation: any;
    expanded: boolean;
    onToggleExpanded: () => void;
    isOwner?: boolean; // <--- Agregamos esta prop opcional
};

const getPublicationHref = (r: any): string | null => {
    if (!r) return null;
    return `/experience/${String(r.publicationId)}`;
};

export const ReservationActions: React.FC<ReservationActionsProps> = ({
                                                                          reservation,
                                                                          expanded,
                                                                          onToggleExpanded,
                                                                          isOwner = false // Valor por defecto
                                                                      }) => {
    const navigate = useNavigate();
    const publicationHref = getPublicationHref(reservation);
    const isExternal = typeof publicationHref === "string" && /^https?:\/\//.test(publicationHref);

    // Lógica para detectar estado pendiente
    const status = String(reservation.status || reservation.statusName || reservation.state || "").toUpperCase();
    const isPending = status === "PENDING";

    // ID para la redirección
    const reservationId = reservation.id ?? reservation._id;

    return (
        <div className="mt-3 flex items-center justify-between gap-2">
            {/* Lado Izquierdo: Botón Detalles */}
            <div className="flex items-center">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onToggleExpanded}
                    aria-expanded={expanded}
                    className="text-muted-foreground hover:text-foreground"
                >
                    {expanded ? "Ocultar detalles" : "Ver detalles"}
                </Button>
            </div>

            {/* Lado Derecho: Acciones Principales (Pagar y Ver Publicación) */}
            <div className="flex items-center gap-2">

                {/* --- BOTÓN PAGAR (Solo si es pendiente y no soy dueño) --- */}
                {isPending && !isOwner && (
                    <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white h-8 px-3 shadow-sm"
                        onClick={() => navigate(`/checkout/${reservationId}`)}
                    >
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                        Pagar
                    </Button>
                )}

                {/* Botón Ver Publicación */}
                {publicationHref ? (
                    isExternal ? (
                        <Button size="sm" variant="ghost" asChild className="text-orange-500 hover:text-orange-600 hover:bg-orange-50">
                            <a
                                href={publicationHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm underline-offset-4"
                            >
                                Ir a la publicación
                            </a>
                        </Button>
                    ) : (
                        <Button size="sm" variant="ghost" asChild className="text-orange-500 hover:text-orange-600 hover:bg-orange-50">
                            <Link to={publicationHref} className="text-sm underline-offset-4">
                                Ir a la publicación
                            </Link>
                        </Button>
                    )
                ) : (
                    <div className="text-xs text-muted-foreground">Sin link</div>
                )}
            </div>
        </div>
    );
};