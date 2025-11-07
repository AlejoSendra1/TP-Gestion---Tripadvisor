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
import { Star, Trophy, Trash2, Loader2, MoreVertical } from "lucide-react";

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
  currentUserEmail?: string;
  xpReward: number;
  isSubmitting: boolean;
  onSubmitReview: (rating: number, content: string) => void;
  onDeleteReview: (reviewerEmail: string) => void;
  deletingReviewId: string | null;
}

export function ReviewsSection({
  reviews,
  currentUserEmail,
  xpReward,
  isSubmitting,
  onSubmitReview,
  onDeleteReview,
  deletingReviewId,
}: ReviewsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onSubmitReview(rating, newComment);
    setNewComment("");
    setRating(5);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6">Reviews</h3>

        {/* Añadir Comentario */}
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
            {isSubmitting ? "Enviando..." : `Enviá tu reseña y ganá ${xpReward} de XP`}
          </Button>
        </div>

        {/* Lista de Comentarios */}
        <div className="space-y-4">
          {reviews.map((comment) => {
            const isOwner = currentUserEmail === comment.reviewerEmail;
            return (
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
                      <span className="font-medium">
                        {comment.username} {comment.userLastname}
                      </span>
                      <div className="flex items-center">
                        {[...Array(comment.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{comment.text}</p>
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
          })}
        </div>
      </CardContent>
    </Card>
  );
}