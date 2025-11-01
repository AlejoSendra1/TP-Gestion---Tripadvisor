import { Building2, UtensilsCrossed, Mountain, Coffee, Camera, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: "hotels",
    name: "Hotels",
    icon: Building2,
    color: "bg-primary",
    selectedColor: "bg-primary/80",
    count: "12,543",
  },
  {
    id: "restaurants",
    name: "Restaurants",
    icon: UtensilsCrossed,
    color: "bg-accent",
    selectedColor: "bg-primary/80",
    count: "8,923",
  },
  {
    id: "tours",
    name: "Tours",
    icon: Mountain,
    color: "bg-adventure",
    selectedColor: "bg-primary/80",
    count: "5,432",
  },
  {
    id: "cafes",
    name: "Cafes",
    icon: Coffee,
    color: "bg-experience",
    selectedColor: "bg-primary/80",
    count: "3,821",
  },
  {
    id: "attractions",
    name: "Attractions",
    icon: Camera,
    color: "bg-success",
    selectedColor: "bg-primary/80",
    count: "7,234",
  },
  {
    id: "flights",
    name: "Flights",
    icon: Plane,
    color: "bg-secondary",
    selectedColor: "bg-primary/80",
    count: "15,678",
  },
];

interface CategoriesProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
}

export function Categories({ selectedCategory, onCategorySelect }: CategoriesProps) {
  const handleCategoryClick = (categoryId: string) => {
    // Si la categoría ya está seleccionada, la deseleccionamos
    if (selectedCategory === categoryId) {
      onCategorySelect(undefined);
    } else {
      onCategorySelect(categoryId);
    }
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing experiences and earn XP points by sharing your reviews in different categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <Card
                key={category.id}
                className={cn(
                  "group cursor-pointer hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0",
                  isSelected && "ring-2 ring-primary ring-offset-2" // Anillo de selección
                )}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-all duration-300",
                      isSelected 
                        ? `${category.selectedColor} scale-110 shadow-lg` // Efecto cuando está seleccionado
                        : `${category.color} group-hover:scale-110`
                    )}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={cn(
                    "font-semibold mb-1 transition-colors",
                    isSelected 
                      ? "text-primary" 
                      : "group-hover:text-primary"
                  )}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} places
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}