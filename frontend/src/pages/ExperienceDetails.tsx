import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, DollarSign, Trophy, ArrowLeft, Calendar, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - in real app this would come from API
const experienceData = {
  "1": {
    id: "1",
    title: "Luxury Ocean View Resort",
    images: ["/src/assets/hotel-example.jpg", "/src/assets/hero-travel.jpg"],
    rating: 4.8,
    reviewCount: 324,
    location: "Maldives",
    price: "$450/night",
    category: "hotel" as const,
    xpReward: 50,
    isPopular: true,
    description: "Experience luxury at its finest with breathtaking ocean views, world-class amenities, and exceptional service. This premium resort offers the perfect escape for travelers seeking ultimate relaxation and adventure.",
    amenities: ["Ocean View", "Spa", "Pool", "Restaurant", "Gym", "WiFi"],
    availability: "Available"
  },
  "2": {
    id: "2",
    title: "Gourmet Italian Bistro",
    images: ["/src/assets/restaurant-example.jpg"],
    rating: 4.6,
    reviewCount: 189,
    location: "Rome, Italy",
    price: "$85/person",
    category: "restaurant" as const,
    xpReward: 30,
    isPopular: false,
    description: "Authentic Italian cuisine in the heart of Rome. Our chef-curated menu features traditional recipes passed down through generations, using only the finest local ingredients.",
    amenities: ["Outdoor Seating", "Wine Selection", "Chef's Special", "Live Music"],
    availability: "Available"
  },
  "3": {
    id: "3",
    title: "Sunrise Mountain Adventure",
    images: ["/src/assets/tour-example.jpg"],
    rating: 4.9,
    reviewCount: 92,
    location: "Swiss Alps",
    price: "$120/person",
    category: "tour" as const,
    xpReward: 75,
    isPopular: false,
    description: "Join us for an unforgettable sunrise hike through the majestic Swiss Alps. This guided tour includes professional equipment, safety briefing, and breathtaking photo opportunities.",
    amenities: ["Professional Guide", "Equipment Included", "Photo Service", "Small Group"],
    availability: "Available"
  }
};

const mockComments = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "SJ",
    rating: 5,
    date: "2 days ago",
    text: "Absolutely incredible experience! The service was outstanding and the views were breathtaking. Will definitely be coming back!",
    xpEarned: 50
  },
  {
    id: 2,
    user: "Mike Chen",
    avatar: "MC",
    rating: 4,
    date: "1 week ago",
    text: "Great place with amazing atmosphere. Food was delicious and staff was very friendly. Highly recommend!",
    xpEarned: 30
  },
  {
    id: 3,
    user: "Emma Wilson",
    avatar: "EW",
    rating: 5,
    date: "2 weeks ago",
    text: "Perfect for a romantic getaway. Every detail was thoughtfully planned. Thank you for an unforgettable experience!",
    xpEarned: 50
  }
];

export default function ExperienceDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState(mockComments);

  const experience = id ? experienceData[id as keyof typeof experienceData] : null;

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header userXP={2450} userLevel={12} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Experience not found</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "hotel": return "bg-primary text-primary-foreground";
      case "restaurant": return "bg-accent text-accent-foreground";
      case "tour": return "bg-adventure text-adventure-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const handleReserve = () => {
    toast({
      title: "Reservation Initiated",
      description: "Redirecting to booking system...",
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      user: "You",
      avatar: "YO",
      rating,
      date: "Just now",
      text: newComment,
      xpEarned: experience.xpReward
    };

    setComments([comment, ...comments]);
    setNewComment("");

    toast({
      title: `+${experience.xpReward} XP Earned!`,
      description: "Thanks for sharing your experience!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userXP={2450} userLevel={12} />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experiences
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getCategoryColor(experience.category)}>
                  {experience.category}
                </Badge>
                {experience.isPopular && (
                  <Badge className="bg-experience text-experience-foreground">
                    Popular
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{experience.title}</h1>

              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-medium">{experience.rating}</span>
                  <span className="ml-1">({experience.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  {experience.location}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {experience.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${experience.title} ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">About this experience</h3>
                <p className="text-muted-foreground leading-relaxed">{experience.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">What's included</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {experience.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center bg-secondary/50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">Reviews & Comments</h3>

                {/* Add Comment */}
                <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-medium mb-3">Share your experience</h4>
                  <div className="flex items-center mb-3">
                    <span className="mr-2 text-sm">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 cursor-pointer ${
                          star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  <Textarea
                    placeholder="Tell others about your experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                  />
                  <Button onClick={handleSubmitComment} className="w-full md:w-auto">
                    <Trophy className="h-4 w-4 mr-2" />
                    Submit Review & Earn {experience.xpReward} XP
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{comment.user}</span>
                            <div className="flex items-center">
                              {[...Array(comment.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">{comment.date}</span>
                            <Badge variant="outline" className="text-xs">
                              +{comment.xpEarned} XP
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">{experience.price}</div>
                  <div className="text-sm text-muted-foreground">per {experience.category === 'hotel' ? 'night' : 'person'}</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Availability:</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {experience.availability}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm bg-gradient-experience bg-clip-text text-transparent font-medium">
                    <Trophy className="h-4 w-4 mr-2 text-experience" />
                    Earn {experience.xpReward} XP when you review
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleReserve} className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reserve Now
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Save to Wishlist
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Contact Host
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* XP Reward Info */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-experience" />
                  <h4 className="font-semibold mb-1">Earn XP Rewards</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your experience and earn {experience.xpReward} XP points to level up your profile!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}