// src/pages/ExperienceDetails.tsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

// --- Hooks de datos ---
import {
  usePublicationDetail,
  type ReviewDTO,
} from "@/hooks/usePublicationDetail";
import { useDeletePublication } from "@/hooks/useDeletePublication"; // <-- HOOK DE BORRADO

// --- Hooks de UI y Auth ---
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// --- Componentes de UI (shadcn/ui) ---
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
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
  Trash2, // <-- Icono de Borrar
  Loader2, // <-- Icono de Carga
} from "lucide-react";


// --- Tipo local para la UI ---
type DisplayReview = {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  xpEarned: number;
};

export default function ExperienceDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Hook para OBTENER datos ---
  const {
    data: publication,
    isLoading,
    isError,
  } = usePublicationDetail(id);

  // --- Hook para BORRAR datos ---
  const { mutate: performDelete, isPending: isDeleting } =
      useDeletePublication();

  // --- Estados locales para UI (reseñas) ---
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState<DisplayReview[]>([]);

  // Lógica de Gamificación (local)
  const xpReward = 50;

  // --- Sincronizar Reseñas de la API al estado local ---
  useEffect(() => {
    if (publication && publication.reviews) {
      const fetchedReviews = publication.reviews.map((review: ReviewDTO) => ({
        id: review.id,
        user: review.authorName,
        avatar: review.authorName.substring(0, 2).toUpperCase(),
        rating: review.rating,
        date: "Hace un tiempo",
        text: review.comment,
        xpEarned: 30, // Mock
      }));
      setComments(fetchedReviews);
    }
  }, [publication]);

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
    // (Esta lógica iría a la página de checkout)
    alert("Redirigiendo a la reserva...");
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: DisplayReview = {
      id: comments.length + 1, // ID local temporal
      user: "Tú",
      avatar: "TÚ",
      rating,
      date: "Justo ahora",
      text: newComment,
      xpEarned: xpReward,
    };

    setComments([comment, ...comments]);
    setNewComment("");
    setRating(5);
    // (Aquí iría la llamada al hook 'useCreateReview')
  };

  // --- Renderizado de Carga y Error ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-background">
          <Header userXP={2450} userLevel={12} />
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold">Cargando...</h1>
          </div>
        </div>
    );
  }

  if (isError || !publication) {
    return (
        <div className="min-h-screen bg-background">
          <Header userXP={2450} userLevel={12} />
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
        <Header userXP={2450} userLevel={12} />

        <div className="container mx-auto px-4 py-8">
          {/* Botón Volver */}
          <Link to="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
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
                                onClick={() => performDelete(id!)} // <-- Llama al hook
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
                    About this Experience
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
                    Details
                  </h3>
                  <RenderSpecificDetails details={publication.specificDetails} />
                </CardContent>
              </Card>

              {/* Sección de Comentarios */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    Reviews
                  </h3>

                  {/* Añadir Comentario */}
                  <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-medium mb-3">Share your experience</h4>
                    <div className="flex items-center mb-3">
                      <span className="mr-2 text-sm">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                              key={star}
                              className={`h-5 w-5 cursor-pointer ${
                                  star <= rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                              }`}
                              onClick={() => setRating(star)}
                          />
                      ))}
                    </div>
                    <Textarea
                        placeholder="Tell us about your experience..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-3"
                    />
                    <Button
                        onClick={handleSubmitComment}
                        className="w-full md:w-auto"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Submit review and gain {xpReward} XP
                    </Button>
                  </div>

                  {/* Lista de Comentarios */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="border-b pb-4 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                              {comment.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{comment.user}</span>
                                <div className="flex items-center">
                                  {[...Array(comment.rating)].map((_, i) => (
                                      <Star
                                          key={i}
                                          className="h-3 w-3 text-yellow-500 fill-current"
                                      />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                              {comment.date}
                            </span>
                                <Badge variant="outline" className="text-xs">
                                  +{comment.xpEarned} XP
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">
                                {comment.text}
                              </p>
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
              {/* Card de Reserva */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${publication.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per{" "}
                      {publication.publicationType.toLowerCase() === "hotel"
                          ? "night"
                          : "person"}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Availability:</span>
                      <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                      >
                        Available
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm bg-gradient-experience bg-clip-text text-transparent font-medium">
                      <Trophy className="h-4 w-4 mr-2 text-experience" />
                      Gain {xpReward} XP by reviewing this experience!
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                        onClick={handleReserve}
                        className="w-full"
                        size="lg"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Save to Wishlist
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Get in touch with {publication.host?.name || "Host"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Info de XP */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-experience" />
                    <h4 className="font-semibold mb-1">Gain XP rewards!</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your experience and gain {xpReward} XP to level up!
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