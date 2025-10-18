import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-travel.jpg";

export function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Beautiful travel destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-adventure/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Discover & Earn
          <span className="block text-accent">Your Adventures</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          Share your travel experiences, gain XP points, and unlock exclusive rewards while helping fellow travelers discover amazing places.
        </p>

        {/* Search Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-hero max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Where to?" className="pl-10" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Check-in" type="date" className="pl-10" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Check-out" type="date" className="pl-10" />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Guests" className="pl-10" />
            </div>
          </div>
          
          <Button variant="hero" size="lg" className="w-full md:w-auto px-8">
            <Search className="mr-2 h-4 w-4" />
            Search Adventures
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">50K+</div>
            <div className="text-white/80">Experiences</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">25K+</div>
            <div className="text-white/80">Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">1M+</div>
            <div className="text-white/80">XP Earned</div>
          </div>
        </div>
      </div>
    </section>
  );
}