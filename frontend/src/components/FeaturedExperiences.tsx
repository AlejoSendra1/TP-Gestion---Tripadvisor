import { ExperienceCard } from "./ExperienceCard";
import hotelImage from "@/assets/hotel-example.jpg";
import restaurantImage from "@/assets/restaurant-example.jpg";
import tourImage from "@/assets/tour-example.jpg";

const featuredExperiences = [
  {
    id: "1",
    title: "Grand Luxury Hotel & Spa",
    image: hotelImage,
    rating: 4.8,
    reviewCount: 342,
    location: "Manhattan, New York",
    price: "$189/night",
    category: "hotel" as const,
    xpReward: 150,
    isPopular: true,
  },
  {
    id: "2", 
    title: "Artisan Coastal Bistro",
    image: restaurantImage,
    rating: 4.9,
    reviewCount: 189,
    location: "Santa Monica, CA",
    price: "$$$",
    category: "restaurant" as const,
    xpReward: 100,
  },
  {
    id: "3",
    title: "Mountain Adventure Hiking Tour",
    image: tourImage,
    rating: 4.7,
    reviewCount: 156,
    location: "Rocky Mountains, CO",
    price: "$75/person",
    category: "tour" as const,
    xpReward: 200,
    isPopular: true,
  },
  {
    id: "4",
    title: "Oceanview Resort & Casino",
    image: hotelImage,
    rating: 4.6,
    reviewCount: 278,
    location: "Miami Beach, FL",
    price: "$245/night",
    category: "hotel" as const,
    xpReward: 150,
  },
  {
    id: "5",
    title: "Farm-to-Table Experience",
    image: restaurantImage,
    rating: 4.8,
    reviewCount: 124,
    location: "Napa Valley, CA",
    price: "$$$$",
    category: "restaurant" as const,
    xpReward: 120,
  },
  {
    id: "6",
    title: "Desert Safari Adventure",
    image: tourImage,
    rating: 4.9,
    reviewCount: 98,
    location: "Phoenix, AZ",
    price: "$95/person",
    category: "tour" as const,
    xpReward: 180,
  },
];

export function FeaturedExperiences() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Experiences
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the most popular destinations and experiences shared by our community of travelers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredExperiences.map((experience) => (
            <ExperienceCard key={experience.id} {...experience} />
          ))}
        </div>
      </div>
    </section>
  );
}