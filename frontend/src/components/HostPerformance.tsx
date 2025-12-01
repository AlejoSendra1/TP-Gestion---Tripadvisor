// File: frontend/src/components/HostPerformance.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, DollarSign, Trophy, TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

type TopPublication = {
  id: string | number;
  title: string;
  income: number;
};

type HostStatsResponse = {
  avgRating: number | null;
  totalIncome: number | string | null;
  topPublication: TopPublication | null;
};

type Props = {
  ownerEmail?: string;
};

const HostPerformance: React.FC<Props> = ({ ownerEmail }) => {
  const [stats, setStats] = useState<HostStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format;

  function extractEmailFromToken(): string | null {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return null;
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      // Pad base64 string if necessary
      while (b64.length % 4) b64 += "=";
      // Decode safely (handle unicode)
      const jsonPayload = decodeURIComponent(
        atob(b64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const obj = JSON.parse(jsonPayload);
      return obj?.email || obj?.username || obj?.sub || null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);

    const email = ownerEmail || extractEmailFromToken();
    if (!email) {
      setError("No hay email de host disponible (ni prop ni auth).");
      setLoading(false);
      return;
    }

    apiClient
      .get(`/hosts/${encodeURIComponent(email)}/stats`)
      .then((res) => {
        const data: HostStatsResponse = res.data ?? ({} as any);
        const totalIncomeNormalized =
          data.totalIncome == null ? 0 : typeof data.totalIncome === "string" ? Number(data.totalIncome) : data.totalIncome;
        const avgRatingNormalized = data.averageRating ?? 0;
        const topPublicationNormalized = data.topPublication
          ? { ...data.topPublication, income: Number((data.topPublication as any).income ?? 0) }
          : null;

        setStats({
          avgRating: avgRatingNormalized,
          totalIncome: totalIncomeNormalized,
          topPublication: topPublicationNormalized,
        });
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar las estadísticas");
      })
      .finally(() => setLoading(false));
  }, [ownerEmail]);

  const avgRating = stats?.avgRating ?? 0;
  const totalRevenue = Number(stats?.totalIncome ?? 0);
  const topPublication = stats?.topPublication ?? { id: "0", title: "—", income: 0 };

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
        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <>
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

            <div>
              <h4 className="text-sm font-semibold mb-2">Mayor ingreso</h4>

              <div className="space-y-2">
                <div className="p-3 rounded-lg border bg-gradient-to-r from-orange-50 to-orange-100 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{topPublication.title}</div>
                    <div className="text-xs text-muted-foreground">{currency(Number(topPublication.income))} totales</div>
                  </div>
                  <div className="p-2 rounded-full bg-orange-200">
                    <Trophy className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HostPerformance;
