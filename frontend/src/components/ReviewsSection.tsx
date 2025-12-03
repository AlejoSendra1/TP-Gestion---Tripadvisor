import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, Trophy, Trash2, Loader2, MoreVertical, ThumbsUp, ThumbsDown, Sparkles, MessageSquare } from "lucide-react";
import { useReviewSummary } from "@/hooks/useReviewSummary";
import { useReviewQualification } from "@/hooks/useReviewQualification";
import { formatDate } from "@/lib/datesFormater";

type DisplayReview = {
  id: string;
  username: string;
  userLastname: string;
  reviewerEmail: string;
  avatar: string;
  rating: number;
  createdAt: string;
  text: string;
};

interface ReviewsSectionProps {
  reviews: DisplayReview[];
  publicationId: string;
  currentUserEmail?: string;
  xpReward: number;
  isSubmitting: boolean;
  onSubmitReview: (rating: number, content: string) => void;
  onDeleteReview: (reviewerEmail: string) => void;
  deletingReviewId: string | null;
}

export function ReviewsSection({
                                 reviews,
                                 publicationId,
                                 currentUserEmail,
                                 xpReward,
                                 isSubmitting,
                                 onSubmitReview,
                                 onDeleteReview,
                                 deletingReviewId,
                               }: ReviewsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  const { summaryText, isLoading: isSummaryLoading, error: summaryError } = useReviewSummary(publicationId);
  const { qualifications, handleLike, handleDislike, isLoadingInitial } = useReviewQualification(publicationId, currentUserEmail);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onSubmitReview(rating, newComment);
    setNewComment("");
    setRating(5);
  };

  const userReview = reviews.find(review => review.reviewerEmail === currentUserEmail);
  const otherReviews = reviews.filter(review => review.reviewerEmail !== currentUserEmail);

  const renderReview = (comment: DisplayReview, isUserReview: boolean = false) => {
    const isOwner = currentUserEmail === comment.reviewerEmail;
    const qualification = qualifications[comment.reviewerEmail];
    const isLiked = qualification?.liked || false;
    const isDisliked = qualification?.disliked || false;

    return (
        <div
            key={comment.id || comment.reviewerEmail}
            className={`p-6 rounded-2xl transition-all duration-300 border ${
                isUserReview
                    ? 'bg-blue-50/50 border-blue-100 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}
        >
          <div className="flex items-start gap-4">
            {/* Avatar con gradiente */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-sm ${
                isUserReview
                    ? "bg-gradient-to-br from-blue-500 to-cyan-400"
                    : "bg-gradient-to-br from-orange-400 to-yellow-400"
            }`}>
              {comment.avatar}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 font-aileron text-base">
                        {comment.username} {comment.userLastname}
                    </span>
                    {isUserReview && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-2 h-5 text-[10px]">
                          TÚ
                        </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                          <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-100"}`}
                          />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">• {formatDate(comment.createdAt)}</span>
                  </div>
                </div>

                {/* Menú de acciones (Dueño) */}
                {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={deletingReviewId === comment.reviewerEmail}>
                          {deletingReviewId === comment.reviewerEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => onDeleteReview(comment.reviewerEmail)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Borrar reseña
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed text-sm">{comment.text}</p>

              {/* Botones de Like/Dislike */}
              {!isUserReview && (
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-3 rounded-full text-xs font-medium gap-1.5 ${isLiked ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800' : 'text-muted-foreground hover:bg-gray-100'}`}
                        onClick={() => handleLike(comment.reviewerEmail)}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      Útil
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-3 rounded-full text-xs font-medium gap-1.5 ${isDisliked ? 'bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800' : 'text-muted-foreground hover:bg-gray-100'}`}
                        onClick={() => handleDislike(comment.reviewerEmail)}
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${isDisliked ? 'fill-current' : ''}`} />
                      No útil
                    </Button>
                  </div>
              )}
            </div>
          </div>
        </div>
    );
  };

  return (
      <div className="space-y-8">

        {/* Título de la Sección */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black font-aileron flex items-center gap-2">
            Reseñas <span className="text-muted-foreground font-medium text-lg">({reviews.length})</span>
          </h3>
        </div>

        {/* --- TARJETA DE RESUMEN IA (Estilo Premium) --- */}
        {summaryText && !isSummaryLoading && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-yellow-50 to-white border border-orange-100 shadow-sm p-6 md:p-8">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-yellow-500" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold font-aileron text-lg text-orange-950">Resumen de Opiniones con IA</h4>
                  <Badge variant="outline" className="border-orange-200 text-orange-600 bg-white/50 backdrop-blur-sm text-[10px] h-5">
                    BETA
                  </Badge>
                </div>

                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                  {summaryText}
                </div>
              </div>
            </div>
        )}

        {isSummaryLoading && (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center bg-gray-50/50">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Generando resumen con IA...</p>
            </div>
        )}

        {summaryError && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm flex items-center gap-2">
              <span>⚠️ Error al cargar el resumen: {summaryError}</span>
            </div>
        )}

        {/* --- FORMULARIO DE NUEVA RESEÑA --- */}
        {!userReview && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg font-aileron leading-tight">Compartí tu experiencia</h4>
                  <p className="text-sm text-muted-foreground">Tu opinión ayuda a otros viajeros a decidir.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Selector de Estrellas Grande */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">¿Cómo calificarías tu experiencia?</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="group p-1 focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                        >
                          <Star
                              className={`h-8 w-8 transition-colors ${
                                  star <= rating
                                      ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                                      : "text-gray-200 fill-gray-50 group-hover:text-yellow-200"
                              }`}
                          />
                        </button>
                    ))}
                    <span className="ml-3 text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md">
                            {rating === 5 ? "¡Excelente!" : rating === 4 ? "Muy buena" : rating === 3 ? "Regular" : rating === 2 ? "Mala" : "Terrible"}
                        </span>
                  </div>
                </div>

                <Textarea
                    placeholder="Contanos los detalles... ¿Qué fue lo que más te gustó? ¿Qué podría mejorar?"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[120px] resize-none text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-primary/50 rounded-xl"
                />

                <div className="flex justify-end">
                  <Button
                      onClick={handleSubmitComment}
                      className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                      disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                        <Trophy className="h-5 w-5 mr-2 text-yellow-200" />
                    )}
                    {isSubmitting ? "Publicando..." : `Enviar Reseña (+${xpReward} XP)`}
                  </Button>
                </div>
              </div>
            </div>
        )}

        {/* --- LISTADO DE RESEÑAS --- */}
        <div className="space-y-6 pt-4">
          {isLoadingInitial ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                <p>Cargando opiniones de la comunidad...</p>
              </div>
          ) : (
              <>
                {userReview && (
                    <div className="animate-fade-in-up">
                      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 ml-1">Tu reseña publicada</h4>
                      {renderReview(userReview, true)}
                    </div>
                )}

                {otherReviews.length > 0 && (
                    <div className="animate-fade-in-up delay-100">
                      {userReview && <div className="h-px bg-gray-100 my-8" />} {/* Separador si hay reseña propia */}
                      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 ml-1">
                        Opiniones de la comunidad
                      </h4>
                      <div className="space-y-4">
                        {otherReviews.map((comment) => renderReview(comment, false))}
                      </div>
                    </div>
                )}

                {reviews.length === 0 && !userReview && (
                    <div className="text-center py-12 px-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <div className="bg-white p-4 rounded-full shadow-sm w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-300" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Aún no hay reseñas</h4>
                      <p className="text-gray-500">¡Sé el primero en contar tu experiencia y ganá puntos XP!</p>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
}