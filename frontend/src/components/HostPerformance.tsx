// File: frontend/src/components/HostPerformance.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, DollarSign, Trophy, TrendingUp } from "lucide-react";

const HostPerformance: React.FC = () => {
  // Valores hardcodeados de ejemplo
  const avgRating = 4.7;
  const totalRevenue = 18765.5;
  const topPublication = { id: "42", title: "Casa en la costa", revenue: 5234.5 };
  const otherPubs = [
    { id: "37", title: "Ático céntrico", revenue: 4120.0 },
    { id: "29", title: "Cabaña en el bosque", revenue: 2930.0 }
  ];

  const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format;

  return (
    <Card className="max-w-4xl mx-auto border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-orange-100">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <span>Desempeño</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Grid de métricas principales (sin Trophy) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-card flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-100">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <div className="text-base font-semibold">{avgRating.toFixed(1)} / 5</div>
              <div className="text-xs text-muted-foreground">Promedio de rating</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-card flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-base font-semibold">{currency(totalRevenue)}</div>
              <div className="text-xs text-muted-foreground">Ingresos totales</div>
            </div>
          </div>
        </div>

        {/* Detalle por publicación (trophy solo en la primera) */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Ingresos por publicacion</h4>

          <div className="space-y-2">
            {/* Mejor publicación - trophy a la derecha */}
            <div className="p-3 rounded-lg border bg-gradient-to-r from-orange-50 to-orange-100 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-sm">{topPublication.title}</div>
                <div className="text-xs text-muted-foreground">{currency(topPublication.revenue)} totales</div>
              </div>
              <div className="p-2 rounded-full bg-orange-200">
                <Trophy className="h-5 w-5 text-orange-600" />
              </div>
            </div>

            {/* Otras publicaciones - sin trophy ni etiqueta de ingresos */}
            {otherPubs.map(pub => (
              <div key={pub.id} className="p-2 rounded-lg border bg-card flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{pub.title}</div>
                  <div className="text-xs text-muted-foreground">{currency(pub.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HostPerformance;
