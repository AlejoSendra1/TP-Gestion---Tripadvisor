import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type ReservationActionsProps = {
  reservation: any;
  expanded: boolean;
  onToggleExpanded: () => void;
};

const getPublicationHref = (r: any): string | null => {
  if (!r) return null;
  return `/experience/${String(r.publicationId)}`;
};

export const ReservationActions: React.FC<ReservationActionsProps> = ({ 
  reservation, 
  expanded,
  onToggleExpanded 
}) => {
  const publicationHref = getPublicationHref(reservation);
  const isExternal = typeof publicationHref === "string" && /^https?:\/\//.test(publicationHref);

  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
        >
          {expanded ? "Ocultar detalles" : "Detalles"}
        </Button>
      </div>

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
  );
};