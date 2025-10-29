import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search as SearchIcon, Filter, MapPin, Star, DollarSign, Loader2 } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { apiClient } from "@/lib/apiClient";
import { PublicationList } from "@/components/PublicationList";

export type PublicationSummary = {
    id: string; // Es 'Long' en Java, pero en TS/JS lo manejamos como string
    title: string;
    price: number; // Es 'double' en Java
    city: string;
    country: string;
    mainImageUrl: string;
    publicationType: string;
};

const API_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:8080';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  
  const [publications, setPublications] = useState<PublicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      // Aquí usas la query junto con otros parámetros que necesites
      //const otherParams = obtenerOtrosParametros(); // tu lógica aquí
      
      const response = await apiClient.get<PublicationSummary[]>(`/publications/search?q=${query.toString()}`);
      setPublications(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };
  // Cargar publications desde el backend
  // useEffect(() => {
  //   const fetchPublications = async () => {
  //     setLoading(true);
  //     setError(null);
      
  //     try {
  //       const params = new URLSearchParams();
  //       if (searchTerm) params.append('q', searchTerm);
  //       if (selectedCategory !== 'all') params.append('category', selectedCategory);
  //       if (selectedLocation !== 'all') params.append('location', selectedLocation);
  //       params.append('minPrice', priceRange[0].toString());
  //       params.append('maxPrice', priceRange[1].toString());
  //       if (minRating > 0) params.append('minRating', minRating.toString());

  //       const response = await apiClient.get<PublicationSummary[]>(`/publications/search?${params.toString()}`);
        
  //       if (!response.ok) {
  //         throw new Error('Error al buscar experiencias');
  //       }
        
  //       const data = await response.json();
  //       setPublications(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Error desconocido');
  //       console.error('Error fetching experiences:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPublications();
  // }, [searchTerm, selectedCategory, selectedLocation, priceRange, minRating]);

  // Cargar ubicaciones disponibles
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await apiClient.get<PublicationSummary[]>("/publications");
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };

    fetchLocations();
  }, []);

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const params = new URLSearchParams();
  //   if (searchTerm) params.set("q", searchTerm);
  //   if (selectedCategory !== "all") params.set("category", selectedCategory);
  //   if (selectedLocation !== "all") params.set("location", selectedLocation);
  //   setSearchParams(params);
  // };

  const sortedPublications = [...publications].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setPriceRange([0, 500]);
    setMinRating(0);
    setSortBy("relevance");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userXP={2450} userLevel={12} />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Buscar Experiencias
          </h1>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    <SelectItem value="hotel">Hoteles</SelectItem>
                    <SelectItem value="restaurant">Restaurantes</SelectItem>
                    <SelectItem value="tour">Tours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Ubicación</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Ubicaciones</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Rango de Precio: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500}
                  min={0}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating Mínimo: {minRating > 0 ? `${minRating}+` : "Cualquiera"}
                </label>
                <Slider
                  value={[minRating]}
                  onValueChange={([value]) => setMinRating(value)}
                  max={5}
                  min={0}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <Separator />

              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar Por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                    <SelectItem value="rating">Mejor Valorados</SelectItem>
                    <SelectItem value="xp">Más XP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {loading ? 'Buscando...' : `${sortedPublications.length} experiencias encontradas`}
                </h2>
                {searchTerm && (
                  <p className="text-muted-foreground">
                    Resultados para "{searchTerm}"
                  </p>
                )}
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="capitalize">
                    {selectedCategory}
                  </Badge>
                )}
                {selectedLocation !== "all" && (
                  <Badge variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedLocation}
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    {minRating}+ Rating
                  </Badge>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            )}

            {/* Publications Grid */}
            {!loading && !error && sortedPublications.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PublicationList publications={publications} />
              </div>
            )}

            {/* No Results */}
            {!loading && !error && sortedPublications.length === 0 && (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron experiencias</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar tus criterios de búsqueda o filtros
                </p>
                <Button onClick={clearFilters}>Limpiar Filtros</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;