import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Star, Trophy, Camera, TrendingUp } from "lucide-react";

const Profile = () => {
  // Mock user data - in a real app this would come from authentication/database
  const user = {
    name: "Adventure Explorer",
    email: "explorer@questescapes.com",
    avatar: "",
    joinDate: "January 2024",
    totalXP: 2850,
    currentLevel: 8,
    nextLevelXP: 3000,
    reviewsCount: 42,
    placesVisited: 28,
    photosShared: 156,
    helpfulVotes: 89
  };

  const achievements = [
    { name: "Explorer", icon: "🗺️", description: "Visited 25+ places", earned: true },
    { name: "Reviewer", icon: "✍️", description: "Written 40+ reviews", earned: true },
    { name: "Photographer", icon: "📸", description: "Shared 150+ photos", earned: true },
    { name: "Helper", icon: "🤝", description: "Received 50+ helpful votes", earned: true },
    { name: "Globe Trotter", icon: "🌍", description: "Visited 50+ places", earned: false },
    { name: "Master Reviewer", icon: "⭐", description: "Written 100+ reviews", earned: false }
  ];

  const recentReviews = [
    {
      id: 1,
      placeName: "Seaside Resort & Spa",
      type: "Hotel",
      rating: 5,
      date: "2 days ago",
      xpEarned: 150,
      excerpt: "Amazing beachfront location with exceptional service..."
    },
    {
      id: 2,
      placeName: "Mountain Peak Adventure",
      type: "Tour",
      rating: 4,
      date: "1 week ago",
      xpEarned: 200,
      excerpt: "Challenging hike with breathtaking views at the summit..."
    },
    {
      id: 3,
      placeName: "Local Flavors Bistro",
      type: "Restaurant",
      rating: 5,
      date: "2 weeks ago",
      xpEarned: 125,
      excerpt: "Authentic local cuisine with fresh ingredients..."
    }
  ];

  const getXPColor = (xp: number) => {
    if (xp >= 200) return "xp-platinum";
    if (xp >= 150) return "xp-gold";
    if (xp >= 100) return "xp-silver";
    return "xp-bronze";
  };

  const progressPercentage = ((user.totalXP % 500) / 500) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header userXP={user.totalXP} userLevel={user.currentLevel} />
      
      <main className="container py-8 space-y-8">
        {/* Profile Header */}
        <Card className="bg-gradient-card">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center lg:justify-start gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    Member since {user.joinDate}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level {user.currentLevel}</span>
                    <span className="text-sm text-muted-foreground">{user.totalXP} / {user.nextLevelXP} XP</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {user.nextLevelXP - user.totalXP} XP until Level {user.currentLevel + 1}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{user.reviewsCount}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-experience">{user.placesVisited}</div>
                  <div className="text-xs text-muted-foreground">Places</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-adventure">{user.photosShared}</div>
                  <div className="text-xs text-muted-foreground">Photos</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-success">{user.helpfulVotes}</div>
                  <div className="text-xs text-muted-foreground">Helpful</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-adventure" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    achievement.earned ? 'bg-success/10 border-success/20' : 'bg-muted/50 border-border opacity-60'
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                  {achievement.earned && (
                    <Badge variant="default" className="text-xs">Earned</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-adventure" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{review.placeName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{review.type}</Badge>
                          <span>{review.date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < review.rating ? 'text-adventure fill-adventure' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                        <Badge 
                          className={`text-xs bg-${getXPColor(review.xpEarned)} text-${getXPColor(review.xpEarned)}-foreground`}
                        >
                          +{review.xpEarned} XP
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.excerpt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;