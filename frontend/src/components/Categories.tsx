import { Building2, UtensilsCrossed, Mountain, Coffee, Camera, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    id: "hotels",
    name: "Hotels",
    icon: Building2,
    color: "bg-primary",
    count: "12,543",
  },
  {
    id: "restaurants",
    name: "Restaurants",
    icon: UtensilsCrossed,
    color: "bg-accent",
    count: "8,923",
  },
  {
    id: "tours",
    name: "Tours",
    icon: Mountain,
    color: "bg-adventure",
    count: "5,432",
  },
  {
    id: "cafes",
    name: "Cafes",
    icon: Coffee,
    color: "bg-experience",
    count: "3,821",
  },
  {
    id: "attractions",
    name: "Attractions",
    icon: Camera,
    color: "bg-success",
    count: "7,234",
  },
  {
    id: "flights",
    name: "Flights",
    icon: Plane,
    color: "bg-secondary",
    count: "15,678",
  },
];

export function Categories() {
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
            return (
              <Card
                key={category.id}
                className="group cursor-pointer hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0"
              >
                <CardContent className="p-6 text-center">
                  <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
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