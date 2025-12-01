import { Badge } from "@/components/ui/badge";
import React from 'react';

export interface ItemData {
  title: string;
  price: number;
  IconComponent: React.ElementType;
  description: string;
  isActive?: boolean;
}

// Assumes Card, Badge, and Lucide icons are imported
export const GridItemCard: React.FC<{ item: ItemData }> = ({ item }) => {
  const { title, price, IconComponent, description, isActive } = item;

  // Use the icon component passed via props
  const Icon = IconComponent;

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        // Apply the primary, highlighted style if isActive is true
        isActive
          ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
          : 'bg-card border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Item Icon */}
          <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          {/* Item Title */}
          <span
            className={`text-lg font-bold ${
              isActive ? 'text-primary' : ''
            }`}
          >
            {title}
          </span>
        </div>

        {/* Price Badge */}
        <Badge variant="secondary" className="text-xs"> {/* */}
          ${price.toFixed(2)}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mt-2">
        {description}
      </p>
    </div>
  );
};