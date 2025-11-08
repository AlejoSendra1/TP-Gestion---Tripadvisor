import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Star, Trophy, Camera, TrendingUp, Gift, Award } from "lucide-react";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular llamada a la API
    // En producción: fetch('/api/user/profile')
    const mockApiResponse = {
      id: 1,
      firstName: "Explorador",
      lastName: "Aventurero",
      email: "explorador@trippy.com",
      photo: "",
      levelInfo: {
        currentLevel: 8,
        currentXp: 2850,
        xpForNextLevel: 3500,
        xpRequiredForNextLevel: 650,
        progressPercentage: 76.92,
        benefits: "20% de descuento • Check-in/out flexibles",
        discountPercentage: 20
      },
      reviewsCount: 42,
      placesVisited: 28,
      photosShared: 156,
      helpfulVotes: 89
    };

    setTimeout(() => {
      setUserData(mockApiResponse);
      setLoading(false);
    }, 500);
  }, []);

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const { levelInfo } = userData;
  const joinDate = "Enero 2024";

  // Sistema de niveles con beneficios detallados
  const levelBenefits = [
    { level: 1, discount: 0, benefits: ["Acceso básico a la plataforma"] },
    { level: 2, discount: 5, benefits: ["5% de descuento en reservas"] },
    { level: 3, discount: 10, benefits: ["10% de descuento en reservas", "Badge de Explorador"] },
    { level: 4, discount: 10, benefits: ["10% de descuento", "Prioridad en atención al cliente"] },
    { level: 5, discount: 15, benefits: ["15% de descuento", "Acceso a ofertas exclusivas"] },
    { level: 6, discount: 15, benefits: ["15% de descuento", "Acceso VIP a eventos"] },
    { level: 7, discount: 20, benefits: ["20% de descuento", "Upgrades gratuitos según disponibilidad"] },
    { level: 8, discount: 20, benefits: ["20% de descuento", "Check-in/out flexibles"] },
    { level: 9, discount: 25, benefits: ["25% de descuento", "Concierge personal"] },
    { level: 10, discount: 30, benefits: ["30% de descuento", "Acceso Elite", "Todas las ventajas premium"] },
  ];

  const achievements = [
    { name: "Explorador", icon: "🗺️", description: "Visitó 25+ lugares", earned: userData.placesVisited >= 25 },
    { name: "Crítico", icon: "✍️", description: "Escribió 40+ reseñas", earned: userData.reviewsCount >= 40 },
    { name: "Fotógrafo", icon: "📸", description: "Compartió 150+ fotos", earned: userData.photosShared >= 150 },
    { name: "Colaborador", icon: "🤝", description: "Recibió 50+ votos útiles", earned: userData.helpfulVotes >= 50 },
    { name: "Trotamundos", icon: "🌍", description: "Visitó 50+ lugares", earned: userData.placesVisited >= 50 },
    { name: "Maestro Crítico", icon: "⭐", description: "Escribió 100+ reseñas", earned: userData.reviewsCount >= 100 }
  ];

  const recentReviews = [
    {
      id: 1,
      placeName: "Resort & Spa Costero",
      type: "Hotel",
      rating: 5,
      date: "hace 2 días",
      xpEarned: 150,
      excerpt: "Increíble ubicación frente al mar con un servicio excepcional..."
    },
    {
      id: 2,
      placeName: "Aventura en la Cima",
      type: "Actividad",
      rating: 4,
      date: "hace 1 semana",
      xpEarned: 200,
      excerpt: "Caminata desafiante con vistas impresionantes en la cumbre..."
    },
    {
      id: 3,
      placeName: "Bistró Sabores Locales",
      type: "Restaurante",
      rating: 5,
      date: "hace 2 semanas",
      xpEarned: 125,
      excerpt: "Auténtica cocina local con ingredientes frescos..."
    }
  ];

  const getXPColor = (xp) => {
    if (xp >= 200) return "bg-purple-500 text-white";
    if (xp >= 150) return "bg-yellow-500 text-white";
    if (xp >= 100) return "bg-gray-400 text-white";
    return "bg-orange-500 text-white";
  };

  const getLevelColor = (level) => {
    if (level >= 10) return "text-purple-500";
    if (level >= 7) return "text-yellow-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userXP={levelInfo.currentXp} userLevel={levelInfo.currentLevel} />

      <main className="container py-8 space-y-8">
        {/* Encabezado del Perfil */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={userData.photo} alt={`${userData.firstName} ${userData.lastName}`} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {userData.firstName[0]}{userData.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <p className="text-muted-foreground">{userData.email}</p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center lg:justify-start gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    Miembro desde {joinDate}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className={`h-5 w-5 ${getLevelColor(levelInfo.currentLevel)}`} />
                      <span className="text-lg font-bold">Nivel {levelInfo.currentLevel}</span>
                      {levelInfo.discountPercentage > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {levelInfo.discountPercentage}% descuento
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP
                    </span>
                  </div>
                  <Progress value={levelInfo.progressPercentage} className="h-3" />
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {levelInfo.xpRequiredForNextLevel} XP para el Nivel {levelInfo.currentLevel + 1}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{userData.reviewsCount}</div>
                  <div className="text-xs text-muted-foreground">Reseñas</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-500">{userData.placesVisited}</div>
                  <div className="text-xs text-muted-foreground">Lugares</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-500">{userData.photosShared}</div>
                  <div className="text-xs text-muted-foreground">Fotos</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-500">{userData.helpfulVotes}</div>
                  <div className="text-xs text-muted-foreground">Útiles</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Beneficios del Nivel Actual */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Beneficios Actuales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Award className={`h-6 w-6 ${getLevelColor(levelInfo.currentLevel)}`} />
                  <span className="text-xl font-bold">Nivel {levelInfo.currentLevel}</span>
                </div>
                <div className="space-y-2">
                  {levelBenefits
                    .find(lb => lb.level === levelInfo.currentLevel)
                    ?.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 text-sm">Próximos beneficios (Nivel {levelInfo.currentLevel + 1})</h4>
                <div className="space-y-2">
                  {levelBenefits
                    .find(lb => lb.level === levelInfo.currentLevel + 1)
                    ?.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5">→</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Logros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    achievement.earned 
                      ? 'bg-green-500/10 border-green-500/20 shadow-sm' 
                      : 'bg-muted/50 border-border opacity-60'
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                  {achievement.earned && (
                    <Badge variant="default" className="text-xs bg-green-500">Obtenido</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reseñas Recientes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Reseñas Recientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{review.placeName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{review.type}</Badge>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge className={`text-xs ${getXPColor(review.xpEarned)}`}>
                        +{review.xpEarned} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{review.excerpt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabla de Niveles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sistema de Niveles y Beneficios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {levelBenefits.map((levelData) => (
                <div
                  key={levelData.level}
                  className={`p-4 rounded-lg border transition-all ${
                    levelData.level === levelInfo.currentLevel
                      ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                      : levelData.level < levelInfo.currentLevel
                      ? 'bg-muted/30 border-muted opacity-60'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-bold ${
                      levelData.level === levelInfo.currentLevel ? 'text-primary' : ''
                    }`}>
                      Nivel {levelData.level}
                    </span>
                    {levelData.level === levelInfo.currentLevel && (
                      <Badge variant="default" className="text-xs">Actual</Badge>
                    )}
                  </div>
                  {levelData.discount > 0 && (
                    <Badge variant="secondary" className="mb-2">
                      {levelData.discount}% descuento
                    </Badge>
                  )}
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {levelData.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;