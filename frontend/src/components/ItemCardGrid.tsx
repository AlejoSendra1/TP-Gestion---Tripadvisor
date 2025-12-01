import { useMyItemBenefits } from '@/hooks/useShopItems';
import React from 'react';
import { ShoppingBag, Plane, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridItemCard, ItemData } from './GridItemCard';


export const ItemCardGrid: React.FC<{
  title: string;
  IconComponent: React.ElementType;
  gridCols: number;
}> = ({ title, IconComponent, gridCols }) => {

  // 🏆 1. HOOK CALL IS NOW INSIDE THE COMPONENT
  const { data: itemBenefitsData, isLoading: itemsLoading, error: itemsError } = useMyItemBenefits();

  // 2. Icon Mapping and Get Icon Component
  const iconMap = {
    ShoppingBag: ShoppingBag,
    Plane: Plane,
    Gift: Gift,
    TrendingUp: TrendingUp,
    // ...
  };
  const getIconComponent = (name: string): React.ElementType => {
    return iconMap[name] || ShoppingBag;
  };

  // 3. Data Processing with useMemo
  const gridData: ItemData[] = React.useMemo(() => {
    if (!itemBenefitsData) return [];

    return itemBenefitsData.map(item => ({
        title: item.title,
        price: item.price,
        description: item.description,
        isActive: item.isActive,
        IconComponent: getIconComponent(item.iconName),
    }));
  }, [itemBenefitsData]);

  // 4. Render Logic (including Loading/Error states)
  const CardIcon = IconComponent;
  const gridClass = `grid md:grid-cols-2 lg:grid-cols-${gridCols} gap-4`;

  // Conditionally render content based on loading/error states
  if (itemsLoading) {
    return <div className="text-center py-4">Cargando artículos...</div>;
  }

  if (itemsError) {
    return <div className="text-center py-4 text-red-500">Error al cargar artículos.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CardIcon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gridData.length > 0 ? (
          <div className={gridClass}>
            {gridData.map((item, index) => (
              <GridItemCard key={index} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">No hay artículos disponibles.</p>
        )}
      </CardContent>
    </Card>
  );
};