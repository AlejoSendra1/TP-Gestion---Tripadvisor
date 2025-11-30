import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Gift, Sparkles, TrendingUp, Check, X } from 'lucide-react';
import shopService, { Benefit, PurchaseResponse } from '@/services/shopService';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface PointShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PointShopDialog = ({ open, onOpenChange }: PointShopDialogProps) => {
  const { user, updateUser } = useAuth();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const currentXp = user?.userXP || 0;

  useEffect(() => {
    if (open) {
      loadBenefits();
    }
  }, [open]);

  const loadBenefits = async () => {
    setLoading(true);
    try {
      const data = await shopService.getShopBenefits();
      setBenefits(data);
    } catch (error) {
      console.error('Error al cargar beneficios:', error);
      toast.error('No se pudieron cargar los beneficios');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (benefit: Benefit) => {
    if (currentXp < benefit.cost) {
      toast.error('No tienes suficientes puntos XP');
      return;
    }

    setPurchasing(benefit.id);
    try {
      const response: PurchaseResponse = await shopService.purchaseBenefit(benefit.id);
      
      if (response.success) {
        if (updateUser) {
          updateUser({ ...user!, userXP: response.remainingXp });
        }
        
        toast.success(response.message || '¡Beneficio adquirido exitosamente!', {
          description: `Te quedan ${response.remainingXp} XP`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al comprar el beneficio';
      toast.error(errorMessage);
    } finally {
      setPurchasing(null);
    }
  };

  const getBenefitIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
        return <Gift className="h-5 w-5" />;
      case 'XP_BONUS':
        return <TrendingUp className="h-5 w-5" />;
      case 'PRIORITY_SUPPORT':
        return <Sparkles className="h-5 w-5" />;
      case 'FREE_UPGRADE':
        return <Sparkles className="h-5 w-5" />;
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

  const canAfford = (cost: number) => currentXp >= cost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-yellow-500" />
            Tienda de Puntos
          </DialogTitle>
          <DialogDescription>
            Canjea tus puntos XP por beneficios exclusivos
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tus puntos disponibles</p>
                <p className="text-3xl font-bold text-foreground">{currentXp} XP</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Nivel {user?.userLevel || 1}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando beneficios...
          </div>
        ) : benefits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay beneficios disponibles en este momento
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit) => {
              const affordable = canAfford(benefit.cost);
              const isPurchasing = purchasing === benefit.id;

              return (
                <Card
                  key={benefit.id}
                  className={`transition-all ${
                    affordable
                      ? 'border-primary/30 hover:border-primary hover:shadow-md'
                      : 'opacity-60 border-muted'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getBenefitIcon(benefit.type)}
                        <CardTitle className="text-lg">{benefit.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getBenefitTypeLabel(benefit.type)}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm mt-2">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold">{benefit.cost}</span>
                        <span className="text-sm text-muted-foreground">XP</span>
                      </div>
                      <Button
                        onClick={() => handlePurchase(benefit)}
                        disabled={!affordable || isPurchasing}
                        variant={affordable ? 'default' : 'secondary'}
                        size="sm"
                      >
                        {isPurchasing ? (
                          'Comprando...'
                        ) : affordable ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Canjear
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Insuficiente
                          </>
                        )}
                      </Button>
                    </div>

                    {benefit.discountPercentage && (
                      <div className="mt-3 text-sm text-primary font-medium">
                        🎁 {benefit.discountPercentage}% de descuento en tu próxima reserva
                      </div>
                    )}
                    {benefit.xpBonus && (
                      <div className="mt-3 text-sm text-primary font-medium">
                        ⭐ +{benefit.xpBonus} XP bonus
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};