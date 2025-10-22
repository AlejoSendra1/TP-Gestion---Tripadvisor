// src/pages/ExperienceDetails.tsx

// Importamos 'useEffect' para sincronizar reseñas
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// --- 1. Importamos el hook y los tipos ---
import {
  usePublicationDetail,
  type ReviewDTO,
  type PublicationDetailDTO
} from "@/hooks/usePublicationDetail";

// --- (Todos tus imports de UI) ---
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Trophy, ArrowLeft, Calendar, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Tipo local para la UI ---
// Mantenemos esto para poder añadir reseñas localmente
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
  const { toast } = useToast();

  // --- 2. Llamamos al Hook ---
  // ¡Toda la lógica de fetching se resume en esta línea!
  const {
    data: publication,
    isLoading,
    isError
  } = usePublicationDetail(id);

  // --- Estados locales para la UI ---
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  // Este estado guarda las reseñas (las de la API + las nuevas)
  const [comments, setComments] = useState<DisplayReview[]>([]);

  // --- Lógica de Gamificación ---
  // La definimos localmente ya que no viene en el DTO
  const xpReward = 50;

  // --- 3. Sincronizar Reseñas ---
  // Este Effect carga las reseñas de la API en nuestro estado 'comments'
  // la primera vez que 'publication' se carga.
  useEffect(() => {
    if (publication && publication.reviews) {
      // Convertimos ReviewDTO en DisplayReview
      const fetchedReviews = publication.reviews.map((review: ReviewDTO) => ({
        id: review.id,
        user: review.authorName,
        avatar: review.authorName.substring(0, 2).toUpperCase(),
        rating: review.rating,
        date: "Hace un tiempo", // DTO no tiene fecha
        text: review.comment,
        xpEarned: 30, // Mockeamos XP
      }));
      setComments(fetchedReviews);
    }
  }, [publication]); // Se ejecuta solo cuando 'publication' cambia

  // --- 4. Estados Derivados ---
  // Calculamos esto desde el *estado* 'comments' para que se
  // actualice al añadir una nueva reseña localmente.
  const avgRating =
      comments.length > 0
          ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
          : "N/A";
  const reviewCount = comments.length;

  // --- 5. Manejadores de Eventos (UI) ---
  const handleReserve = () => {
    toast({
      title: "Reserva Iniciada",
      description: "Redirigiendo al sistema de reservas...",
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    // Creamos la nueva reseña para la UI
    const comment: DisplayReview = {
      id: comments.length + 1, // ID local temporal
      user: "Tú",
      avatar: "TÚ",
      rating,
      date: "Justo ahora",
      text: newComment,
      xpEarned: xpReward,
    };

    // Actualización optimista: la añadimos al estado local
    setComments([comment, ...comments]);
    setNewComment("");
    setRating(5); // Reseteamos

    toast({
      title: `+${xpReward} XP Obtenidos!`,
      description: "¡Gracias por compartir tu experiencia!",
    });
    // Aquí es donde harías un 'POST' al back-end para guardarla
  };

  // --- 6. Renderizado de Carga y Error ---
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
            <h1 className="text-2xl font-bold mb-4">Experiencia no encontrada</h1>
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

  // --- 7. Renderizado Principal (JSX) ---
  // Si llegamos aquí, 'publication' tiene datos.

  const getCategoryColor = (cat: string) => {
    const lowerCat = cat.toLowerCase(); // 'HOTEL' -> 'hotel'
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

  return (
      <div className="min-h-screen bg-background">
        <Header userXP={2450} userLevel={12} />

        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link to="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Experiencias
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getCategoryColor(publication.publicationType)}>
                    {publication.publicationType.toLowerCase()}
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4">{publication.title}</h1>

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

              {/* Images */}
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

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Sobre esta experiencia</h3>
                  <p className="text-muted-foreground leading-relaxed">{publication.description}</p>
                </CardContent>
              </Card>

              {/* Specific Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Qué incluye / Detalles</h3>
                  {/* Usamos el helper para renderizar el mapa 'specificDetails' */}
                  <RenderSpecificDetails details={publication.specificDetails} />
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Reseñas y Comentarios</h3>

                  {/* Add Comment */}
                  <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                    <h4 className="font-medium mb-3">Comparte tu experiencia</h4>
                    <div className="flex items-center mb-3">
                      <span className="mr-2 text-sm">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                              key={star}
                              className={`h-5 w-5 cursor-pointer ${
                                  star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                              onClick={() => setRating(star)}
                          />
                      ))}
                    </div>
                    <Textarea
                        placeholder="Cuéntale a otros sobre tu experiencia..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-3"
                    />
                    <Button onClick={handleSubmitComment} className="w-full md:w-auto">
                      <Trophy className="h-4 w-4 mr-2" />
                      Enviar Reseña & Gana {xpReward} XP
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {/* Mapeamos el *estado* 'comments' */}
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
                    <div className="text-3xl font-bold text-primary mb-2">${publication.price}</div>
                    <div className="text-sm text-muted-foreground">
                      por {publication.publicationType.toLowerCase() === "hotel" ? "noche" : "persona"}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disponibilidad:</span>
                      {/* Hardcodeado, ya que no viene en el DTO */}
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Disponible
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm bg-gradient-experience bg-clip-text text-transparent font-medium">
                      <Trophy className="h-4 w-4 mr-2 text-experience" />
                      Gana {xpReward} XP cuando dejes tu reseña
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={handleReserve} className="w-full" size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar Ahora
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Contactar a {publication.host?.name || "Anfitrión"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* XP Reward Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-experience" />
                    <h4 className="font-semibold mb-1">Gana Recompensas XP</h4>
                    <p className="text-sm text-muted-foreground">
                      ¡Comparte tu experiencia y gana {xpReward} XP para subir de nivel!
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
// Lo mantenemos aquí ya que solo lo usa esta página
function RenderSpecificDetails({ details }: { details: { [key: string]: unknown } }) {

  const toTitleCase = (str: string) => {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase());
  };

  return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Mapeamos las entradas del objeto 'details' */}
        {Object.entries(details).map(([key, value]) => {

          // Caso 1: 'services' de Coworking
          // Hacemos el check de 'unknown'
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

          // Caso 2: Pares clave-valor simples (ej: "roomCount": 50)
          // Hacemos el check de 'unknown'
          if (typeof value === "string" || typeof value === "number") {
            return (
                <div key={key} className="flex items-center bg-secondary/50 px-3 py-2 rounded-lg">
              <span className="text-sm">
                <span className="font-medium">{toTitleCase(key)}:</span> {String(value)}
              </span>
                </div>
            );
          }

          // No renderizamos otros tipos (ej: null, undefined)
          return null;
        })}
      </div>
  );
}