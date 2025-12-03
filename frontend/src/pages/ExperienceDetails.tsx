import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCreateReview } from "@/hooks/useCreateReview";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  usePublicationDetail,
} from "@/hooks/usePublicationDetail";
import { useDeletePublication } from "@/hooks/useDeletePublication";
import { useDeleteReview } from "@/hooks/useDeleteReview";
import { useReviews, type ReviewDTO } from "@/hooks/useReviews";
import { usePersonalizedPrice } from "@/hooks/usePersonalizedPrice";
import { PriceDisplay } from "@/components/PriceDisplay";
import ReservationCalendar from "@/components/reservation/ReservationCalendar";
import { useUserReservations } from "@/hooks/useUserReservations";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Star,
  MapPin,
  Trophy,
  ArrowLeft,
  Calendar,
  Trash2,
  Loader2,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import BookingModal from "@/components/BookingModal";

// --- Tipo local para la UI ---
type DisplayReview = {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { reservations } = useUserReservations();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // --- Hooks de Datos ---
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
      !!user && !!id && isTraveler()
  );

  const { mutate: performDelete, isPending: isDeleting } = useDeletePublication();
  const { mutate: deleteReview } = useDeleteReview();
  const { mutate: createReview, isPending: isSubmittingReview } = useCreateReview();
  const {
    data: reviewPage,
  } = useReviews(id);

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [openBooking, setOpenBooking] = useState(false);

  // Gamificación local
  const xpReward = 50;

  // --- Mapeo de Reseñas ---
  const reviewsArray = reviewPage?.content || [];
  const displayReviews: DisplayReview[] = reviewsArray.map((review: ReviewDTO) => ({
    username: review.username,
    userLastname: review.userLastname,
    reviewerEmail: review.reviewerEmail,
    avatar: review.username.substring(0, 2).toUpperCase(),
    rating: review.rating,
    createdAt: review.createdAt || "Reciente",
    text: review.reviewContent,
  }));

  const avgRating = displayReviews.length > 0
      ? (displayReviews.reduce((acc, c) => acc + c.rating, 0) / displayReviews.length).toFixed(1)
      : "N/A";
  const reviewCount = displayReviews.length;

  const canEdit = user && user.role === "HOST" && user.email === publication?.host?.email;

  // --- Lógica Corregida de Imágenes ---
  // Si imageUrls está vacío, usamos mainImageUrl. Si ambos fallan, placeholder.
  const galleryImages = (publication?.imageUrls && publication.imageUrls.length > 0)
      ? publication.imageUrls
      : (publication?.mainImageUrl ? [publication.mainImageUrl] : ["/placeholder.jpg"]);

  // --- Handlers ---
  const handleReserve = () => setOpenBooking(true);

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
        { onSettled: () => setDeletingReviewId(null) }
    );
  };

  // --- Estilos de Categoría (Coherencia con Cards) ---
  const getCategoryStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "hotel": return "bg-orange-100 text-orange-700 border-orange-200";
      case "restaurant": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "tour":
      case "activity": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "coworking": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (isError || !publication) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4 font-aileron">Experiencia no encontrada</h1>
          <Link to="/"><Button variant="outline">Volver al Inicio</Button></Link>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background pb-12">
        <Header />

        {/* Container principal con ancho limitado para mejor lectura */}
        <div className="container max-w-7xl mx-auto px-4 py-8">

          {/* Navegación Superior */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMNA IZQUIERDA: Contenido Principal */}
            <div className="lg:col-span-2 space-y-8">

              {/* Header de la Publicación */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={`px-3 py-1 text-sm font-semibold border ${getCategoryStyle(publication.publicationType)} shadow-sm`}>
                    {publication.publicationType}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground font-medium">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    {publication.location.city}, {publication.location.country}
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black font-aileron tracking-tight text-foreground leading-[1.1]">
                  {publication.title}
                </h1>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100 text-yellow-700 font-bold">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1.5" />
                    {avgRating} <span className="font-normal text-muted-foreground ml-1">({reviewCount} reseñas)</span>
                  </div>
                </div>

                {/* Botones de Host (Si corresponde) */}
                {canEdit && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/experience/${id}/edit`)}>
                        ✏️ Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting}>
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => performDelete(id!)} className="bg-destructive">
                              {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                )}
              </div>

              {/* GALERÍA DE IMÁGENES (Lógica Corregida) */}
              <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                <Carousel className="w-full">
                  <CarouselContent>
                    {galleryImages.map((image, index) => (
                        <CarouselItem key={index}>
                          <div
                              className="aspect-[16/9] md:aspect-[21/9] cursor-zoom-in relative"
                              onClick={() => { setCurrentSlideIndex(index); setIsGalleryOpen(true); }}
                          >
                            <img
                                src={image}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 hover:opacity-100 text-white font-semibold bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm transition-opacity">
                                        Ver pantalla completa
                                    </span>
                            </div>
                          </div>
                        </CarouselItem>
                    ))}
                  </CarouselContent>
                  {galleryImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 h-10 w-10 border-none bg-black/30 text-white hover:bg-black/50" />
                        <CarouselNext className="right-4 h-10 w-10 border-none bg-black/30 text-white hover:bg-black/50" />
                      </>
                  )}
                </Carousel>
              </div>

              {/* Sección: Descripción */}
              <div className="grid gap-8">
                <div className="prose max-w-none">
                  <h3 className="text-2xl font-bold font-aileron mb-4">Sobre esta experiencia</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {publication.description}
                  </p>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-2xl font-bold font-aileron mb-6">Lo que tenés que saber</h3>
                  <RenderSpecificDetails details={publication.specificDetails} />
                </div>
              </div>

              {/* Calendario de Reservas (Solo Host) */}
              {canEdit && (
                  <Card className="border-blue-100 bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700">
                        <Calendar className="h-5 w-5" />
                        Gestión de Reservas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReservationCalendar isOwner={true} publicationId={publication.id} />
                    </CardContent>
                  </Card>
              )}

              {/* Sección de Reseñas */}
              <div className="border-t pt-8">
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
            </div>

            {/* COLUMNA DERECHA: Sidebar Sticky */}
            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">

                {/* Card de Reserva Principal */}
                <Card className="border-0 shadow-xl ring-1 ring-black/5 overflow-hidden rounded-2xl">
                  <CardContent className="p-0">
                    <div className="bg-primary/5 p-6 border-b border-primary/10">
                      <PriceDisplay
                          basePrice={publication.price}
                          personalizedPrice={personalizedPrice}
                          isLoading={isLoadingPrice}
                          publicationType={publication.publicationType}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5">
                          Disponible hoy
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-xl border border-orange-100 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          <Trophy className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-0.5">Rewards</p>
                          <p className="text-sm text-orange-700 leading-tight">
                            Reservá y ganá <span className="font-bold">+{xpReward} XP</span> al dejar tu reseña.
                          </p>
                        </div>
                      </div>

                      <Button
                          onClick={handleReserve}
                          className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                      >
                        Reservá Ahora
                      </Button>

                      <div className="text-center text-xs text-muted-foreground">
                        No se te cobrará nada hasta confirmar.
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </div>

        {/* --- MODALES --- */}

        {/* Booking Modal */}
        <BookingModal
            publicationId={publication.id}
            publicationType={publication.publicationType}
            open={openBooking}
            onClose={() => setOpenBooking(false)}
        />

        {/* Lightbox Gallery */}
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-[95vw] h-[90vh] bg-black/95 border-none p-0 flex items-center justify-center">
            <Carousel opts={{ align: "center", startIndex: currentSlideIndex }} className="w-full h-full flex items-center justify-center">
              <CarouselContent>
                {galleryImages.map((image, index) => (
                    <CarouselItem key={index} className="flex items-center justify-center h-[85vh]">
                      <img src={image} alt={`Full view ${index + 1}`} className="max-w-full max-h-full object-contain" />
                    </CarouselItem>
                ))}
              </CarouselContent>
              {galleryImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 bg-white/10 text-white border-white/20 hover:bg-white/20 h-12 w-12" />
                    <CarouselNext className="right-4 bg-white/10 text-white border-white/20 hover:bg-white/20 h-12 w-12" />
                  </>
              )}
            </Carousel>
          </DialogContent>
        </Dialog>
      </div>
  );
}

// --- Helper Component Refinado ---
function RenderSpecificDetails({ details }: { details: { [key: string]: unknown } }) {
  const toTitleCase = (str: string) => str.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(details).map(([key, value]) => {
          if (!value) return null; // Evitar nulos

          if (key === "services" && Array.isArray(value)) {
            return (
                <div key={key} className="col-span-full">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase mb-2">Servicios incluidos</h4>
                  <div className="flex flex-wrap gap-2">
                    {value.map((service: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 font-normal bg-gray-100 hover:bg-gray-200 text-gray-700">
                          {service}
                        </Badge>
                    ))}
                  </div>
                </div>
            );
          }

          if (typeof value === "string" || typeof value === "number") {
            return (
                <div key={key} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {toTitleCase(key)}
                    </span>
                  <span className="font-medium text-gray-900">{String(value)}</span>
                </div>
            );
          }
          return null;
        })}
      </div>
  );
}