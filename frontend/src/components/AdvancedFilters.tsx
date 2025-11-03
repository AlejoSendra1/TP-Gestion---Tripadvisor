import { useState } from "react";
import { MapPin, DollarSign, Users, Calendar, Star, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export function AdvancedFilters({ onFiltersChange }: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    guests: '',
    minRating: '',
    checkIn: '',
    checkOut: '',
    duration: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      location: '',
      minPrice: '',
      maxPrice: '',
      guests: '',
      minRating: '',
      checkIn: '',
      checkOut: '',
      duration: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="space-y-4">
      {/* Header de Filtros */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            Clear
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {/* Filtros - Se muestran/ocultan */}
      {showFilters && (
        <div className="space-y-4">
          {/* Primera fila de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Location" 
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Min Price */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Min Price" 
                type="number"
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>

            {/* Max Price */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Max Price" 
                type="number"
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>

            {/* Guests */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Guests" 
                type="number"
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', e.target.value)}
              />
            </div>
          </div>

          {/* Segunda fila de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rating */}
            <div className="relative">
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Min. Rating" 
                type="number"
                min="1"
                max="5"
                step="0.1"
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Duration (days)" 
                type="number"
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
              />
            </div>

            {/* Check-in */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Check-in" 
                type="date" 
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.checkIn}
                onChange={(e) => handleFilterChange('checkIn', e.target.value)}
              />
            </div>

            {/* Check-out */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white h-4 w-4" />
              <Input 
                placeholder="Check-out" 
                type="date" 
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                value={filters.checkOut}
                onChange={(e) => handleFilterChange('checkOut', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}