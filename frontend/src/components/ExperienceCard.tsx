import { Star, MapPin, DollarSign, Trophy } from "lucide-react";
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
  xpReward,
  isPopular = false,
}: ExperienceCardProps) {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "hotel": return "bg-primary text-primary-foreground";
      case "restaurant": return "bg-accent text-accent-foreground";
      case "tour": return "bg-adventure text-adventure-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "hotel": return "Hotel";
      case "restaurant": return "Restaurant";
      case "tour": return "Tour";
      default: return cat;
    }
  };

  return (
    <Link to={`/experience/${id}`}>
      <Card className="group overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0 cursor-pointer">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {isPopular && (
          <Badge className="absolute top-3 left-3 bg-experience text-experience-foreground">
            Popular
          </Badge>
        )}
        
        <Badge className={`absolute top-3 right-3 ${getCategoryColor(category)}`}>
          {getCategoryLabel(category)}
        </Badge>

        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-sm font-medium">
          {price}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {location}
        </div>

        {(rating && reviewCount && xpReward) && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground ml-1">({reviewCount})</span>
            </div>

            <div className="flex items-center text-sm bg-gradient-experience bg-clip-text text-transparent font-medium">
              <Trophy className="h-4 w-4 mr-1 text-experience" />
              +{xpReward} XP
            </div>
          </div>
        )}

        <Button variant="experience" className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
    </Link>
  );
}