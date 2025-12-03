// File: frontend/src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { Header } from "@/components/Header"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Star, Trophy, Award, Gift, TrendingUp, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Coins, Sparkles, Check, X, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserReservations } from "@/hooks/useUserReservations";
import { useDeleteReservation } from "@/hooks/useDeleteReservation";
import { useActualUserReviews } from '@/hooks/useReviews';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; 
import ReservationList from "@/components/ReservationList";
import { useNavigate } from "react-router-dom";
import { ActiveBenefitsCard } from '@/components/ActiveBenefitsCard';
import { PointShopDialog } from "@/components/PointShopDialog";
import ReservationCalendar from "@/components/reservation/ReservationCalendar";

const Profile = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 3;
  const { user, isTraveler, updateUser } = useAuth();

  const { reservations, isLoading: reservationsLoading, error: reservationsError, fetchReservations } = useUserReservations();
  const { mutate: deleteReservation, isPending: isDeletingReservation } = useDeleteReservation();
  const [deletingReservationId, setDeletingReservationId] = useState<string | null>(null);

  const { data: userReviewsData, isLoading: reviewsLoading, error: reviewsError } = useActualUserReviews({ page, size: pageSize });

  // Estado para controlar la apertura del diálogo de la tienda
  const [isShopOpen, setIsShopOpen] = useState(false);

  useEffect(() => {
    if (reviewsError) {
      console.error("Error fetching user reviews:", reviewsError);
      if (reviewsError.response) {
        console.error("Axios Response Data:", reviewsError.response.data);
        console.error("Axios Status:", reviewsError.response.status);
      }
    }
  }, [reviewsError]);

  const handleDeleteReservation = (reservationId: string, publicationId: string) => {
    setDeletingReservationId(reservationId);
    deleteReservation(
      { reservationId, publicationId: String(publicationId) },
      {
        onSuccess: () => {
          fetchReservations().catch(() => {});
          navigate("/profile", { replace: true });
        },
        onSettled: () => {
          setDeletingReservationId(null);
        },
      }
    );
  };

  useEffect(() => {
    if (user) {
      fetchReservations().catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No has iniciado sesión</p>
        </div>
      </div>
    );
  }

  if (!isTraveler()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Este perfil es solo para viajeros</p>
        </div>
      </div>
    );
  }

  const currentLevel = user.userLevel || 1;
  const currentXp = user.userXP || 0;
  const currentTrippyCoins = user.userTrippyCoins || 0;

  const calculateXpForLevel = (level) => {
    if (level <= 1) return 0;
    const BASE_XP = 500;
    const XP_MULTIPLIER = 1.5;
    let totalXp = 0;
    for (let i = 1; i < level; i++) {
      totalXp += Math.floor(BASE_XP * Math.pow(XP_MULTIPLIER, i - 1));
    }
    return totalXp;
  };

  const xpForCurrentLevel = calculateXpForLevel(currentLevel);
  const xpForNextLevel = calculateXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXp - xpForCurrentLevel;
  const xpRequiredForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = xpRequiredForNextLevel > 0
    ? Math.min((xpInCurrentLevel / xpRequiredForNextLevel) * 100, 100)
    : 100;

  const getDiscountPercentage = (level) => {
    if (level === 1) return 0;
    if (level === 2) return 5;
    if (level === 3 || level === 4) return 10;
    if (level === 5 || level === 6) return 15;
    if (level === 7 || level === 8) return 20;
    if (level === 9) return 25;
    return level >= 10 ? 30 : 0;
  };

  const discountPercentage = getDiscountPercentage(currentLevel);
  const joinDate = "Diciembre 2025";

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

  const realReviewsCount = userReviewsData?.totalElements || 0;
  const realReservationsCount = reservations?.length || 0;

  const profileStats = {
    reviewsCount: realReviewsCount,
    placesVisited: realReservationsCount,
    photosShared: 0,
    helpfulVotes: 0
  };

  const achievements = [
    { name: "Explorador", icon: "🗺️", description: "Visitó 25+ lugares", earned: profileStats.placesVisited >= 25 },
    { name: "Crítico", icon: "✍️", description: "Escribió 40+ reseñas", earned: profileStats.reviewsCount >= 40 },
    { name: "Fotógrafo", icon: "📸", description: "Compartió 150+ fotos", earned: profileStats.photosShared >= 150 },
    { name: "Colaborador", icon: "🤝", description: "Recibió 50+ votos útiles", earned: profileStats.helpfulVotes >= 50 },
    { name: "Trotamundos", icon: "🌍", description: "Visitó 50+ lugares", earned: profileStats.placesVisited >= 50 },
    { name: "Maestro Crítico", icon: "⭐", description: "Escribió 100+ reseñas", earned: profileStats.reviewsCount >= 100 }
  ];

  const recentReviews = userReviewsData?.content.map(review => ({
    id: review.publicationId,
    publicationId: review.publicationId,
    placeName: review.placeName,
    rating: review.rating,
    content: review.reviewContent,
    date: new Date(review.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    qualification: review.qualification,
  })) || [];

  const getQualificationColor = (qualification) => {
    const q = qualification ?? 0;
    if (q > 0) return "bg-green-500 text-white";
    if (q < 0) return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getLevelColor = (level) => {
    if (level >= 10) return "text-purple-500";
    if (level >= 7) return "text-yellow-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header/>

      <main className="container py-8 space-y-8">
        {/* Encabezado del Perfil */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={user.photo} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </h1>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/edit-profile">Editar</Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center lg:justify-start gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    Miembro desde {joinDate}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className={`h-5 w-5 ${getLevelColor(currentLevel)}`} />
                      <span className="text-lg font-bold">Nivel {currentLevel}</span>
                      {discountPercentage > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {discountPercentage}% descuento
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {currentXp} / {xpForNextLevel} XP
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {xpRequiredForNextLevel} XP para el Nivel {currentLevel + 1}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{profileStats.reviewsCount}</div>
                  <div className="text-xs text-muted-foreground">Reseñas</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-500">{profileStats.placesVisited}</div>
                  <div className="text-xs text-muted-foreground">Reservaciones</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservas del Usuario */}
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Mis reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReservationCalendar isOwner={false} />
            </CardContent>
          </Card>
          {/* --- FIN DE LA SECCIÓN CLAVE --- */}

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
                            <Award className={`h-6 w-6 ${getLevelColor(currentLevel)}`} />
                            <span className="text-xl font-bold">Nivel {currentLevel}</span>
                          </div>
                          <div className="space-y-2">
                            {levelBenefits
                                .find(lb => lb.level === currentLevel)
                                ?.benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                      <span className="text-primary mt-0.5">✓</span>
                                      <span>{benefit}</span>
                                    </div>
                                ))}
                          </div>
                        </div>

                        {currentLevel < 10 && (
                            <div className="pt-4 border-t">
                              <h4 className="font-semibold mb-3 text-sm">Próximos beneficios (Nivel {currentLevel + 1})</h4>
                              <div className="space-y-2">
                                {levelBenefits
                                    .find(lb => lb.level === currentLevel + 1)
                                    ?.benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                          <span className="mt-0.5">→</span>
                                          <span>{benefit}</span>
                                        </div>
                                    ))}
                              </div>
                            </div>
                        )}
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

                    {/* Reseñas Recientes (Hardcodeado) */}
                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Reseñas Recientes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

          {/*{recentReviews.length > 0 ? (*/}
          {/*                  recentReviews.map((review) => (*/}
          {/*                       // ... lógica de renderizado de reseñas*/}
          {/*                      <div key={review.id}></div>*/}
          {/*                  ))*/}
          {/*              ) : (*/}
          {/*                   <p className="text-sm text-muted-foreground text-center py-4">*/}
          {/*                   Aún no has escrito ninguna reseña*/}
          {/*                 </p>*/}
          {/*              )}*/}

                            {reviewsLoading && <p className="text-sm text-muted-foreground text-center py-4">Cargando reseñas...</p>}
                            {reviewsError && <p className="text-sm text-destructive text-center py-4">Error cargando reseñas: {String(reviewsError.message ?? reviewsError)}</p>}

                            {!reviewsLoading && !reviewsError && (recentReviews.length > 0 ? (
                                recentReviews.map((review) => (
                                    <div key={review.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow" onClick={() => navigate(`/experience/${review.publicationId}#personal-review`)}>
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <h3 className="font-medium text-sm">{review.placeName}</h3>
                                          <div className="flex items-center gap-2 mt-1">
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
                                        <Badge className={`text-xs flex items-center gap-1 ${getQualificationColor(review.qualification ?? 0)}`}>
                                          {(review.qualification ?? 0) > 0 ? ( // Safely check qualification
                                              <>
                                                <ThumbsUp className="h-3 w-3" />
                                                {(review.qualification ?? 0)}
                                              </>
                                            ) : (review.qualification ?? 0) < 0 ? ( // Safely check qualification
                                              <>
                                                <ThumbsDown className="h-3 w-3" />
                                                {(review.qualification ?? 0)}
                                              </>
                                            ) : (
                                              <>
                                                {0}
                                                <ThumbsUp className="h-3 w-3" />
                                                <ThumbsDown className="h-3 w-3" />
                                              </>
                                            )}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        {review.content.length > 50
                                          ? review.content.substring(0, 50) + '...'
                                          : review.content
                                        }
                                      </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Aún no has escrito ninguna reseña
                                </p>
                            ))}
                            {userReviewsData && userReviewsData.totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t mt-4">
                                    {/* Previous Button */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                        disabled={userReviewsData.first || reviewsLoading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    {/* Page Status */}
                                    <span className="text-sm text-muted-foreground">
                                        Página {userReviewsData.number + 1} de {userReviewsData.totalPages}
                                    </span>

                                    {/* Next Button */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage(prev => prev + 1)}
                                        disabled={userReviewsData.last || reviewsLoading}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {reviewsLoading && (
                                <p className="text-sm text-muted-foreground text-center py-4 border-t mt-4">
                                    Cargando reseñas...
                                </p>
                            )}

                        </CardContent>
                      </Card>
                    </div>
                  </div>

        {/* Sección de Tienda de Trippy Coins con botón para abrir el diálogo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Tienda de Trippy Coins
              </CardTitle>
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-bold">{currentTrippyCoins} Trippy Coins</span>
                <span className="text-sm text-muted-foreground">disponibles</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Canjea tus Trippy Coins por beneficios exclusivos que mejorarán tus futuras reservas.</p>
            <Button onClick={() => setIsShopOpen(true)}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Abrir Tienda de Trippy Coins
            </Button>
          </CardContent>
        </Card>

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
                    levelData.level === currentLevel
                      ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                      : levelData.level < currentLevel
                        ? 'bg-muted/30 border-muted opacity-60'
                        : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-bold ${
                      levelData.level === currentLevel ? 'text-primary' : ''
                    }`}>
                      Nivel {levelData.level}
                    </span>
                    {levelData.level === currentLevel && (
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

      {/* Diálogo de la Tienda de Puntos */}
      <PointShopDialog open={isShopOpen} onOpenChange={setIsShopOpen} />
    </div>
  );
};

export default Profile;
