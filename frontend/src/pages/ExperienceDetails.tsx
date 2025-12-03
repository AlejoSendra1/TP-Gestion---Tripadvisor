import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCreateReview } from "@/hooks/useCreateReview";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// --- Hooks de datos ---
import {
  usePublicationDetail,
} from "@/hooks/usePublicationDetail";
import { useDeletePublication } from "@/hooks/useDeletePublication";
import { useDeleteReview } from "@/hooks/useDeleteReview"; // <-- NUEVO HOOK
import { useReviews, type ReviewDTO } from "@/hooks/useReviews";
import { usePersonalizedPrice } from "@/hooks/usePersonalizedPrice";
import { PriceDisplay } from "@/components/PriceDisplay";
import ReservationList from "@/components/reservation/ReservationList";
import ReservationCalendar from "@/components/reservation/ReservationCalendar";
import { useUserReservations } from "@/hooks/useUserReservations";
// --- Hooks de UI y Auth ---
import { useAuth } from "@/hooks/use-auth";

// --- Componentes de UI (shadcn/ui) ---
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- Iconos (lucide-react) ---
import {
  Star,
  MapPin,
  Trophy,
  ArrowLeft,
  Calendar,
  Users,
  Heart,
  Trash2,
  Loader2,
} from "lucide-react";

import BookingModal from "@/components/BookingModal"; // <-- nuevo

// --- Tipo local para la UI ---
type DisplayReview = {
  //id: string;
  username: string;
  userLastname: string;
  reviewerEmail: string;
  avatar: string;
  rating: number;
  createdAt: string;
  text: string;
};

export default function ExperienceDetails() {
  const { id } = useParams();
  const { user, isTraveler } = useAuth();
  const navigate = useNavigate();
  const { reservations, isLoading: reservationsLoading, error: reservationsError, fetchReservations } = useUserReservations();

  // --- Hook para OBTENER datos de la publicación ---
  const {
    data: publication,
    isLoading,
    isError,
  } = usePublicationDetail(id);

    const {
        data: personalizedPrice,
        isLoading: isLoadingPrice,
      } = usePersonalizedPrice(
        id,
        !!user && !!id && isTraveler()// Only fetch if user is logged in and we have an ID
      );


  // --- Hook para BORRAR publicación ---
  const { mutate: performDelete, isPending: isDeleting } =
      useDeletePublication();

  // --- Hook para BORRAR review ---
  const { mutate: deleteReview, isPending: isDeletingReview } =
      useDeleteReview();

  // For example, from your API or publication data:
  const reviewsSummaryText = "aca estaria el resumen re q ti re jodido \n aaaaaa\n asdaisjfoafj\nsifjaoifj"; 

  // hooks relacionados a reviews
  const { mutate: createReview, isPending: isSubmittingReview } = useCreateReview();

  // --- Hook para OBTENER datos de las reviews ---
  const {
        data: reviewPage,
        isLoading: isLoadingReviews,
        isError: isErrorReviews,
  } = useReviews(id);

  // --- Estados locales para UI (reseñas) ---
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState<DisplayReview[]>([]);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Estado para abrir modal de reserva
  const [openBooking, setOpenBooking] = useState(false);

  // Lógica de Gamificación (local)
  const xpReward = 50;

  const reviewsArray = reviewPage?.content || [];
  const displayReviews: DisplayReview[] = reviewsArray.map((review: ReviewDTO) => ({
    //id: review.id,
    username: review.username,
    userLastname: review.userLastname,
    reviewerEmail: review.reviewerEmail,
    avatar: review.username.substring(0, 2).toUpperCase(),
    rating: review.rating,
    createdAt: review.createdAt || "Justo ahora",
    text: review.reviewContent,
  }));

  // --- Estados Derivados (para Rating) ---
  const avgRating =
      comments.length > 0
          ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(
              1
          )
          : "N/A";
  const reviewCount = comments.length;

  // --- Lógica de Permisos ---
  const canEdit =
      user && user.role === "HOST" && user.email === publication?.host?.email;

  // --- Manejadores de Eventos (UI) ---
  const handleReserve = () => {
    setOpenBooking(true); // ahora abre el modal en vez de alert
  };

  const handleSubmitComment = (rating: number, content: string) => {
    createReview({
      publicationId: publication.id,
      reviewerEmail: user.email,
      rating: rating,
      reviewContent: content,
    });
  };

  const handleDeleteReview = (userEmail: string) => {
    setDeletingReviewId(userEmail);
    deleteReview(
      { reviewerEmail: userEmail, publicationId: publication.id },
      {
        onSettled: () => {
          setDeletingReviewId(null);
        },
      }
    );
  };

  // --- Renderizado de Carga y Error ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold">Cargando...</h1>
          </div>
        </div>
    );
  }

  if (isError || !publication) {
    return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">
              Experiencia no encontrada
            </h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
    );
  }

  // --- Helper de UI (Color de Badge) ---
  const getCategoryColor = (cat: string) => {
    const lowerCat = cat.toLowerCase();
    switch (lowerCat) {
      case "hotel":
        return "bg-primary text-primary-foreground";
      case "restaurant":
        return "bg-accent text-accent-foreground";
      case "activity":
        return "bg-adventure text-adventure-foreground";
      case "coworking":
        return "bg-purple-600 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // --- Renderizado Principal (JSX) ---
  return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* Botón Volver */}
          <Link to="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Encabezado */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getCategoryColor(publication.publicationType)}>
                    {publication.publicationType.toLowerCase()}
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4">{publication.title}</h1>

                {/* === ZONA DE BOTONES DE HOST === */}
                {canEdit && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Botón de Editar */}
                      <Button
                          variant="outline"
                          onClick={() => navigate(`/experience/${id}/edit`)}
                      >
                        ✏️ Editar publicación
                      </Button>

                      {/* Botón y Diálogo de Eliminar */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={isDeleting}>
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará
                              permanentemente tu publicación de nuestros servidores.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => performDelete(id!)}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                )}
                {/* === FIN ZONA DE BOTONES === */}

                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium">{avgRating}</span>
                    <span className="ml-1">({reviewCount} reseñas)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    {publication.location.city}, {publication.location.country}
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {publication.imageUrls.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`${publication.title} ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                    />
                ))}
              </div>

              {/* Descripción */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Sobre esta experiencia
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {publication.description}
                  </p>
                </CardContent>
              </Card>

              {/* Detalles Específicos */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Detalles
                  </h3>
                  <RenderSpecificDetails details={publication.specificDetails} />
                </CardContent>
              </Card>

              {/* Reservas de la publicaion */}
              {canEdit && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Reservas de esta publicación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReservationCalendar isOwner={true} publicationId={publication.id} />
                  </CardContent>
                </Card>
              )}

              <ReviewsSection
                reviews={displayReviews}
                currentUserEmail={user?.email}
                xpReward={xpReward}
                isSubmitting={isSubmittingReview}
                onSubmitReview={handleSubmitComment}
                onDeleteReview={handleDeleteReview}
                deletingReviewId={deletingReviewId} 
                publicationId={publication.id}              
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Card de Reserva */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <PriceDisplay
                    basePrice={publication.price}
                    personalizedPrice={personalizedPrice}
                    isLoading={isLoadingPrice}
                    publicationType={publication.publicationType}
                  />

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disponibilidad</span>
                      <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                      >
                        Disponible
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm bg-gradient-experience bg-clip-text text-transparent font-medium">
                      <Trophy className="h-4 w-4 mr-2 text-experience" />
                      Ganá XP al reseñar esta publicación!
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                        onClick={handleReserve}
                        className="w-full"
                        size="lg"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservá Ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Info de XP */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-experience" />
                    <h4 className="font-semibold mb-1">Ganate recompensas!</h4>
                    <p className="text-sm text-muted-foreground">
                      Compartí tu reseña y ganá {xpReward} de XP para subir de nivel!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          publicationId={publication.id}
          publicationType={publication.publicationType} // se pasa el tipo
          open={openBooking}
          onClose={() => setOpenBooking(false)}
        />
      </div>
  );
}

// --- Helper Component para renderizar 'specificDetails' ---
function RenderSpecificDetails({
                                 details,
                               }: {
  details: { [key: string]: unknown };
}) {
  const toTitleCase = (str: string) => {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase());
  };

  return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(details).map(([key, value]) => {
          // Caso 1: Array de strings (ej: 'services' de Coworking)
          if (key === "services" && Array.isArray(value)) {
            return value.map((service: string, index: number) => (
                <div
                    key={`${key}-${index}`}
                    className="flex items-center bg-secondary/50 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm">{service}</span>
                </div>
            ));
          }

          // Caso 2: Pares clave-valor simples (string o number)
          if (typeof value === "string" || typeof value === "number") {
            return (
                <div
                    key={key}
                    className="flex items-center bg-secondary/50 px-3 py-2 rounded-lg"
                >
              <span className="text-sm">
                <span className="font-medium">{toTitleCase(key)}:</span>{" "}
                {String(value)}
              </span>
                </div>
            );
          }

          // No renderizar otros tipos (null, undefined, etc.)
          return null;
        })}
      </div>
  );
}