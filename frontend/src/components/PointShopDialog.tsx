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
import { Coins, Gift, Sparkles, TrendingUp, Check, X, AlertCircle } from 'lucide-react';
import shopService, { Benefit, PurchaseResponse } from '@/services/shopService';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface PointShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 🎭 DATOS DE PRUEBA - Eliminar cuando el backend funcione
const MOCK_BENEFITS: Benefit[] = [
  {
    id: 1,
    name: 'Descuento 5%',
    description: 'Obtén un 5% de descuento en tu próxima reserva',
    cost: 200,
    type: 'DISCOUNT',
    discountPercentage: 5,
    singleUse: true
  },
  {
    id: 2,
    name: 'Descuento 10%',
    description: 'Obtén un 10% de descuento en tu próxima reserva',
    cost: 400,
    type: 'DISCOUNT',
    discountPercentage: 10,
    singleUse: true
  },
  {
    id: 3,
    name: 'Bonus XP +50',
    description: 'Gana 50 XP adicionales en tu próxima reserva',
    cost: 150,
    type: 'XP_BONUS',
    xpBonus: 50,
    singleUse: true
  },
  {
    id: 4,
    name: 'Bonus XP +100',
    description: 'Gana 100 XP adicionales en tu próxima reserva',
    cost: 300,
    type: 'XP_BONUS',
    xpBonus: 100,
    singleUse: true
  },
  {
    id: 5,
    name: 'Soporte Prioritario 24h',
    description: 'Acceso a soporte prioritario durante 24 horas',
    cost: 300,
    type: 'PRIORITY_SUPPORT',
    singleUse: true
  },
  {
    id: 6,
    name: 'Upgrade de Categoría',
    description: 'Upgrade gratuito a la siguiente categoría disponible',
    cost: 500,
    type: 'FREE_UPGRADE',
    singleUse: true
  }
];

export const PointShopDialog = ({ open, onOpenChange }: PointShopDialogProps) => {
  const { user, updateUser } = useAuth();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const currentXp = user?.userXP || 0;

  useEffect(() => {
    if (open) {
      console.log('🔓 Dialog opened, loading benefits...');
      loadBenefits();
    }
  }, [open]);

  const loadBenefits = async () => {
    setLoading(true);
    setError(null);
    console.log('⏳ Loading benefits...');
    
    try {
      const data = await shopService.getShopBenefits();
      console.log('✅ Benefits loaded successfully:', data);
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No benefits received from API');
        setError('No se encontraron beneficios disponibles');
      }
      
      setBenefits(data);
      setUseMockData(false);
    } catch (error: any) {
      console.error('❌ Error loading benefits:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Si es un error de red, usar datos de prueba
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('🎭 Using mock data because backend is not available');
        setBenefits(MOCK_BENEFITS);
        setUseMockData(true);
        toast.warning('Usando datos de prueba - Backend no disponible');
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'No se pudieron cargar los beneficios';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  const handlePurchase = async (benefit: Benefit) => {
    if (currentXp < benefit.cost) {
      toast.error('No tienes suficientes puntos XP');
      return;
    }

    // Si estamos usando datos de prueba, simular la compra
    if (useMockData) {
      toast.info('Modo de prueba - La compra no se guardará', {
        description: 'Inicia tu backend para realizar compras reales'
      });
      return;
    }

    setPurchasing(benefit.id);
    try {
      const response: PurchaseResponse = await shopService.purchaseBenefit(benefit.id);
      
      if (response.success) {
        // Actualizar el XP del usuario en el contexto
        if (updateUser && user) {
          updateUser({ userXP: response.remainingXp });
        }
        
        toast.success(response.message || '¡Beneficio adquirido exitosamente!', {
          description: `Te quedan ${response.remainingXp} XP`,
        });
        
        // Opcional: Refrescar la lista de beneficios activos
        // await loadBenefits();
      }
    } catch (error: any) {
      console.error('❌ Error en la compra:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Error al comprar el beneficio';
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
            {useMockData && (
              <Badge variant="outline" className="ml-2 text-xs">
                Modo Prueba
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Canjea tus puntos XP por beneficios exclusivos
          </DialogDescription>
        </DialogHeader>

        {useMockData && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Mostrando datos de prueba. Para ver los beneficios reales, inicia tu backend en el puerto 8080.
            </p>
          </div>
        )}

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
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Cargando beneficios...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <Button onClick={loadBenefits} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        ) : benefits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay beneficios disponibles en este momento</p>
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
                        disabled={!affordable || isPurchasing || useMockData}
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