// File: frontend/src/components/ActiveBenefitsCard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, TrendingUp, Sparkles, Check, Clock } from 'lucide-react';
import shopService, { UserBenefit } from '@/services/shopService';
import { toast } from 'sonner';

export const ActiveBenefitsCard = () => {
  const [activeBenefits, setActiveBenefits] = useState<UserBenefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [using, setUsing] = useState<number | null>(null);

  useEffect(() => {
    loadActiveBenefits();
  }, []);

  const loadActiveBenefits = async () => {
    setLoading(true);
    try {
      const benefits = await shopService.getActiveBenefits();
      setActiveBenefits(benefits);
    } catch (error) {
      console.error('Error al cargar beneficios activos:', error);
      toast.error('No se pudieron cargar tus beneficios activos.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseBenefit = async (userBenefitId: number) => {
    setUsing(userBenefitId);
    try {
      const response = await shopService.useBenefit(userBenefitId);
      if (response.success) {
        toast.success(response.message);
        // Recargar beneficios activos
        await loadActiveBenefits();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al usar el beneficio';
      toast.error(errorMessage);
    } finally {
      setUsing(null);
    }
  };

  const getBenefitIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return <Gift className="h-5 w-5 text-green-500" />;
      case 'XP_BONUS':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'PRIORITY_SUPPORT':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'FREE_UPGRADE':
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getBenefitTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      DISCOUNT: 'Descuento',
      XP_BONUS: 'Bonus XP',
      PRIORITY_SUPPORT: 'Soporte Prioritario',
      FREE_UPGRADE: 'Upgrade Gratis',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Beneficios que se usan automáticamente
  const autoUseBenefits = ['DISCOUNT', 'XP_BONUS'];
  
  // Beneficios que requieren uso manual
  const manualUseBenefits = activeBenefits.filter(
    ub => !autoUseBenefits.includes(ub.benefit.type)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Mis Beneficios Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            Cargando beneficios...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeBenefits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Mis Beneficios Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No tienes beneficios activos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Canjea puntos XP en la tienda para obtener beneficios
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Mis Beneficios Activos
          </div>
          <Badge variant="secondary" className="text-xs">
            {activeBenefits.length} activo{activeBenefits.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Beneficios de uso automático */}
        {activeBenefits
          .filter(ub => autoUseBenefits.includes(ub.benefit.type))
          .map((userBenefit) => (
            <div
              key={userBenefit.id}
              className="p-3 rounded-lg border bg-gradient-to-r from-green-500/5 to-blue-500/5 border-green-500/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getBenefitIcon(userBenefit.benefit.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{userBenefit.benefit.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getBenefitTypeLabel(userBenefit.benefit.type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {userBenefit.benefit.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Adquirido: {formatDate(userBenefit.purchaseDate)}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white text-xs">
                  Auto-uso
                </Badge>
              </div>
              {userBenefit.benefit.discountPercentage && (
                <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Se aplicará automáticamente en tu próxima reserva
                </div>
              )}
              {userBenefit.benefit.xpBonus && (
                <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Se sumará automáticamente en tu próxima reserva
                </div>
              )}
            </div>
          ))}

        {/* Beneficios de uso manual */}
        {manualUseBenefits.map((userBenefit) => (
          <div
            key={userBenefit.id}
            className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getBenefitIcon(userBenefit.benefit.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{userBenefit.benefit.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getBenefitTypeLabel(userBenefit.benefit.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {userBenefit.benefit.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Adquirido: {formatDate(userBenefit.purchaseDate)}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUseBenefit(userBenefit.id)}
                disabled={using === userBenefit.id}
                className="text-xs"
              >
                {using === userBenefit.id ? (
                  'Usando...'
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Usar
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}

        {manualUseBenefits.length === 0 && activeBenefits.length > 0 && (
          <div className="text-center py-2 text-xs text-muted-foreground border-t">
            Todos tus beneficios activos se aplicarán automáticamente
          </div>
        )}
      </CardContent>
    </Card>
  );
};