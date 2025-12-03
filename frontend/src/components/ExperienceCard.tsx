import { Star, MapPin, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ExperienceCardProps {
  id: string;
  title: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  location: string;
  price: string;
  category: string;
  xpReward?: number;
  isPopular?: boolean;
}

export function ExperienceCard({
                                 id,
                                 title,
                                 image,
                                 rating,
                                 reviewCount,
                                 location,
                                 price,
                                 category,
                                 xpReward = 50, // Valor por defecto si no viene, para gamificación
                                 isPopular = false,
                               }: ExperienceCardProps) {

  const getCategoryStyle = (cat: string) => {
    // Usamos colores un poco más suaves/modernos
    switch (cat.toLowerCase()) {
      case "hotel": return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
      case "restaurant": return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
      case "tour":
      case "activity": return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
      case "coworking": return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      hotel: "Hotel",
      restaurant: "Restaurante",
      tour: "Experiencia",
      activity: "Actividad",
      coworking: "Coworking"
    };
    return map[cat.toLowerCase()] || cat;
  };

  return (
      <Link to={`/experience/${id}`} className="block h-full">
        <Card className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white rounded-2xl flex flex-col">
          {/* --- CONTENEDOR DE IMAGEN --- */}
          <div className="relative h-56 overflow-hidden">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay gradiente suave al hacer hover para leer mejor texto si hubiera */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

            {/* Badge de Popularidad (Gamificación) */}
            {isPopular && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-md font-aileron tracking-wide animate-pulse">
                  POPULAR
                </Badge>
            )}

            {/* Categoría (Pill style) */}
            <Badge className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold border ${getCategoryStyle(category)} shadow-sm transition-colors`}>
              {getCategoryLabel(category)}
            </Badge>

            {/* Precio Glassmorphism (Coincide con Hero) */}
            <div className="absolute bottom-3 right-3">
              <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-aileron font-bold shadow-lg flex items-center gap-1">
                {price}
              </div>
            </div>
          </div>

          {/* --- CONTENIDO --- */}
          <CardContent className="p-5 flex flex-col flex-1">
            {/* Título con AILERON */}
            <div className="mb-2">
              <h3 className="font-semibold font-black text-xl leading-tight text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
            </div>

            <div className="flex items-center text-sm text-muted-foreground mb-4 font-medium">
              <MapPin className="h-4 w-4 mr-1.5 text-primary" />
              {location}
            </div>

            {/* Sección de Stats / Gamificación */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              {/* Rating */}
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-bold text-sm text-gray-700">{rating || "New"}</span>
                {reviewCount ? <span className="text-xs text-gray-400 ml-1">({reviewCount})</span> : null}
              </div>

              {/* XP Reward (Estilo Loot de juego) */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-xs font-bold text-adventure bg-adventure/10 px-2 py-1 rounded-md border border-adventure/20">
                  <Trophy className="h-3 w-3 mr-1" />
                  +{xpReward} XP
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full mt-4 text-primary font-bold hover:bg-primary/5 hover:text-primary font-aileron group-hover:underline decoration-2 underline-offset-4">
              Ver Detalles
            </Button>
          </CardContent>
        </Card>
      </Link>
  );
}