import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ExperienceCard } from "@/components/ExperienceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search as SearchIcon, Filter, MapPin, Star, DollarSign } from "lucide-react";

import hotelExample from "@/assets/hotel-example.jpg";
import restaurantExample from "@/assets/restaurant-example.jpg";
import tourExample from "@/assets/tour-example.jpg";

const allExperiences = [
  {
    id: 1,
    title: "Grand Hotel Paradise",
    category: "hotel",
    location: "Bali, Indonesia",
    rating: 4.8,
    reviews: 324,
    price: 150,
    image: hotelExample,
    xpReward: 50,
    description: "Luxury beachfront resort with stunning ocean views"
  },
  {
    id: 2,
    title: "Sakura Sushi Bar",
    category: "restaurant",
    location: "Tokyo, Japan",
    rating: 4.9,
    reviews: 156,
    price: 80,
    image: restaurantExample,
    xpReward: 30,
    description: "Authentic Japanese cuisine in the heart of Tokyo"
  },
  {
    id: 3,
    title: "Machu Picchu Adventure",
    category: "tour",
    location: "Cusco, Peru",
    rating: 4.7,
    reviews: 89,
    price: 200,
    image: tourExample,
    xpReward: 100,
    description: "Guided hiking tour to the ancient Inca citadel"
  },
  {
    id: 4,
    title: "Ocean Breeze Hotel",
    category: "hotel",
    location: "Maldives",
    rating: 4.9,
    reviews: 245,
    price: 300,
    image: hotelExample,
    xpReward: 60,
    description: "Overwater bungalows in paradise"
  },
  {
    id: 5,
    title: "Pasta & Co",
    category: "restaurant",
    location: "Rome, Italy",
    rating: 4.6,
    reviews: 198,
    price: 45,
    image: restaurantExample,
    xpReward: 25,
    description: "Traditional Italian pasta in cozy setting"
  },
  {
    id: 6,
    title: "Safari Adventure",
    category: "tour",
    location: "Serengeti, Tanzania",
    rating: 4.8,
    reviews: 67,
    price: 350,
    image: tourExample,
    xpReward: 120,
    description: "Wildlife safari experience of a lifetime"
  },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedLocation !== "all") params.set("location", selectedLocation);
    setSearchParams(params);
  };

  const filteredExperiences = allExperiences.filter((experience) => {
    const matchesSearch = searchTerm === "" ||
      experience.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experience.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experience.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || experience.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || experience.location.includes(selectedLocation);
    const matchesPrice = experience.price >= priceRange[0] && experience.price <= priceRange[1];
    const matchesRating = experience.rating >= minRating;

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesRating;
  });

  const sortedExperiences = [...filteredExperiences].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "xp":
        return b.xpReward - a.xpReward;
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
            Search Experiences
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for hotels, restaurants, tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hotel">Hotels</SelectItem>
                    <SelectItem value="restaurant">Restaurants</SelectItem>
                    <SelectItem value="tour">Tours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Bali">Bali</SelectItem>
                    <SelectItem value="Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Rome">Rome</SelectItem>
                    <SelectItem value="Maldives">Maldives</SelectItem>
                    <SelectItem value="Peru">Peru</SelectItem>
                    <SelectItem value="Tanzania">Tanzania</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
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
                  Minimum Rating: {minRating > 0 ? `${minRating}+` : "Any"}
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
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="xp">Most XP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear All Filters
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {sortedExperiences.length} experiences found
                </h2>
                {searchTerm && (
                  <p className="text-muted-foreground">
                    Search results for "{searchTerm}"
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

            {/* Experience Grid */}
            {sortedExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    id={experience.id.toString()}
                    title={experience.title}
                    category={experience.category as "hotel" | "restaurant" | "tour"}
                    location={experience.location}
                    rating={experience.rating}
                    reviewCount={experience.reviews}
                    price={experience.price.toString()}
                    image={experience.image}
                    xpReward={experience.xpReward}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No experiences found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;