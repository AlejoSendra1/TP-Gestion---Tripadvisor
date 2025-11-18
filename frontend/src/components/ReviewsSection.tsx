import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, Trophy, Trash2, Loader2, MoreVertical, ThumbsUp, ThumbsDown } from "lucide-react";
import { useReviewSummary } from "@/hooks/useReviewSummary";
import { useReviewQualification } from "@/hooks/useReviewQualification";
import {formatDate} from "@/lib/datesFormater";

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
  const [reviewLikes, setReviewLikes] = useState<Record<string, { liked: boolean; disliked: boolean }>>({});

  // Fetch summary from API
  const { summaryText, isLoading: isSummaryLoading, error: summaryError } = useReviewSummary(publicationId);

  // Handle like/dislike feedback
  const { qualifications, handleLike, handleDislike } = useReviewQualification(publicationId,currentUserEmail,);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onSubmitReview(rating, newComment);
    setNewComment("");
    setRating(5);
  };

  // Separar la review del usuario actual de las demás
  const userReview = reviews.find(review => review.reviewerEmail === currentUserEmail);
  const otherReviews = reviews.filter(review => review.reviewerEmail !== currentUserEmail);

  const renderReview = (comment: DisplayReview, isUserReview: boolean = false) => {
    const isOwner = currentUserEmail === comment.reviewerEmail;
    const qualification = qualifications[comment.reviewerEmail];
    const isLiked = qualification?.liked || false;
    const isDisliked = qualification?.disliked || false;

    return (
      <div
        key={comment.id}
        className={`border rounded-lg p-4 ${isUserReview ? 'bg-blue-50 border-blue-200' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
            {comment.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">
                {comment.username} {comment.userLastname}
              </span>
              {isUserReview && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                  Tu reseña
                </span>
              )}
              <div className="flex items-center">
                {[...Array(comment.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-muted-foreground mb-3">{comment.text}</p>
            
            {/* Sección de utilidad */}
            {!isUserReview &&
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>¿Te resultó útil esta reseña?</span>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-1 ${isLiked ? 'text-green-600' : ''}`}
                onClick={() => handleLike(comment.reviewerEmail)}
              >
                <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-1 ${isDisliked ? 'text-red-600' : ''}`}
                onClick={() => handleDislike(comment.reviewerEmail)}
              >
                <ThumbsDown className={`h-4 w-4 ${isDisliked ? 'fill-current' : ''}`} />
              </Button>
            </div>
            }
          </div>

          {/* Menú de 3 puntos para el propietario */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={deletingReviewId === comment.reviewerEmail}
                >
                  {deletingReviewId === comment.reviewerEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDeleteReview(comment.reviewerEmail)}
                  disabled={deletingReviewId === comment.reviewerEmail}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Borrar reseña
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6">Reviews</h3>

        {/* Resumen de Reviews */}
        {isSummaryLoading && (
          <div className="mb-6 p-6 border bg-orange-100 border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
              <span className="text-muted-foreground">Cargando resumen...</span>
            </div>
          </div>
        )}
        
        {summaryText && !isSummaryLoading && (
          <div className="mb-6 p-6 border bg-orange-100 border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Star className="h-6 w-6 text-yellow-500 fill-current flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg mb-2">Resumen de Reseñas</h4>
                <p className="leading-relaxed whitespace-pre-line">
                  {summaryText}
                </p>
              </div>
            </div>
          </div>
        )}

        {summaryError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            Error al cargar el resumen: {summaryError}
          </div>
        )}

        {/* Añadir Comentario */}
        {!userReview &&
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
          <h4 className="font-medium mb-3">Compartí tu experiencia</h4>
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
            placeholder="Contanos sobre tu experiencia..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3"
          />
          <Button
            onClick={handleSubmitComment}
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Enviando..." : `Enviá tu reseña y ganá XP`}
          </Button>
        </div>
        }

        {/* Lista de Comentarios */}
        <div className="space-y-4">
          {/* Mostrar primero la reseña del usuario actual */}
          {userReview && (
            <>
              <h4 className="font-semibold text-sm text-muted-foreground">Tu reseña</h4>
              {renderReview(userReview, true)}
              {otherReviews.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-4">
                    Otras reseñas ({otherReviews.length})
                  </h4>
                </div>
              )}
            </>
          )}
          
          {/* Mostrar las demás reseñas */}
          {otherReviews.map((comment) => renderReview(comment, false))}
        </div>
      </CardContent>
    </Card>
  );
}