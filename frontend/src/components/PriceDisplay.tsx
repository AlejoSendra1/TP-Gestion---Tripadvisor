import { Loader2 } from "lucide-react";

interface PriceDisplayProps {
  basePrice: number;
  personalizedPrice?: number;
  isLoading?: boolean;
  publicationType: string;
}

export const PriceDisplay = ({
  basePrice,
  personalizedPrice,
  isLoading,
  publicationType,
}: PriceDisplayProps) => {
  const hasDiscount = personalizedPrice !== undefined && personalizedPrice !== basePrice;

  if (isLoading) {
    return (
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Cargando...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-6">
      {hasDiscount ? (
        <div className="space-y-1">
          <div className="text-lg text-muted-foreground line-through">
            ${basePrice}
          </div>
          <div className="text-3xl font-bold text-primary">
            ${personalizedPrice}
          </div>
          <div className="text-xs text-green-600 font-medium">
            ¡Precio especial para vos!
          </div>
        </div>
      ) : (
        <div className="text-3xl font-bold text-primary mb-2">
          ${personalizedPrice ?? basePrice}
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        por{" "}
        {publicationType.toLowerCase() === "hotel" ? "noche" : "persona"}
      </div>
    </div>
  );
};