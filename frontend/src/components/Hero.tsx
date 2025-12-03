import { useState } from "react";
import heroImage from "@/assets/hero-travel.jpg";
import { SearchFilters } from "@/components/SearchFilters";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, MapPin, Sparkles, Plane } from "lucide-react";

interface HeroProps {
  onFiltersChange?: (filters: any) => void;
}

export function Hero({ onFiltersChange }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onFiltersChange) onFiltersChange({ query });
  };

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
    if (onFiltersChange) onFiltersChange({ category: category || ''});
  };

  const handleAdvancedFiltersChange = (filters: any) => {
    if (onFiltersChange) onFiltersChange(filters);
  };

  return (
      <section className="relative min-h-[850px] flex items-center justify-center overflow-hidden pt-16">

        {/* 1. Fondo inmersivo */}
        <div className="absolute inset-0 z-0">
          <img
              src={heroImage}
              alt="Trippy Travel"
              className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        {/* 2. Elementos Flotantes (Gamificación) */}
        {/* Estos iconos flotan suavemente para dar dinamismo */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {/* Izquierda: Trofeo (Recompensas) */}
          <div className="absolute top-[20%] left-[5%] lg:left-[10%] animate-float opacity-90 hidden md:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl transform -rotate-6">
              <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <div className="text-white font-aileron font-bold text-xs mt-2 text-center tracking-wide">LEVEL UP</div>
            </div>
          </div>

          {/* Derecha: Avión (Viajes) */}
          <div className="absolute top-[25%] right-[5%] lg:right-[10%] animate-float-delayed opacity-90 hidden md:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full shadow-2xl transform rotate-12">
              <Plane className="w-8 h-8 text-sky-400 fill-sky-400 drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* 3. Contenido Principal */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 flex flex-col items-center gap-8 text-center">

          {/* Badge Superior */}
          <div className="animate-fade-in-up">
            <Badge className="px-4 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md gap-2 rounded-full font-aileron tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              DESCUBRÍ UNA NUEVA FORMA DE VIAJAR
            </Badge>
          </div>

          {/* Título Principal con AILERON */}
          <div className="space-y-4 max-w-5xl animate-fade-in-up delay-100">
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight font-aileron tracking-tighter drop-shadow-2xl">
              Animate. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400">
              Conocé. Viajá.
            </span>
            </h1>

            <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto font-light font-aileron drop-shadow-md leading-relaxed">
              Sumá <span className="font-bold text-yellow-300">XP</span> con cada aventura y desbloqueá beneficios exclusivos.
              Tu próxima historia comienza acá.
            </p>
          </div>

          {/* 4. Buscador Glassmorphism */}
          <div className="w-full max-w-5xl mt-6 animate-fade-in-up delay-200">
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-1 md:p-6 rounded-[2rem] shadow-2xl ring-1 ring-white/20">
              <SearchFilters
                  onSearch={handleSearch}
                  onCategorySelect={handleCategorySelect}
                  onFiltersChange={handleAdvancedFiltersChange}
                  selectedCategory={selectedCategory}
              />
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-2 text-black/90 text-sm font-aileron font-medium animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-gray/10 backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              5/5 Calificación
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-gray/10 backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-red-400 fill-red-400" />
              Destinos Locales e Internacionales
            </div>
          </div>

        </div>

        {/* Decoración inferior (Fade to content) */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
      </section>
  );
}