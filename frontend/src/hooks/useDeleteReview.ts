import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from 'axios';

interface DeleteReviewParams {
  publicationId: number;
  reviewerEmail: string;
}

type ErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ publicationId, reviewerEmail }: DeleteReviewParams) => {
      console.log("Deleting review:", { publicationId, reviewerEmail });
      
      // Axios automatically throws on error status codes, so no need to check response.ok
      const response = await apiClient.delete(
        `/reviews/${Number(publicationId)}/${reviewerEmail}`
      );

      return { publicationId, reviewerEmail };
    },
    
    onSuccess: (data, variables) => {
      console.log("✅ Review deletion successful");

      // Invalidate ALL reviews queries for this publication (handles different pagination states)
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.publicationId],
        exact: false // This will match all queries starting with ['reviews', publicationId]
      });
      
      // Also invalidate publication query in case it has review data
      queryClient.invalidateQueries({
        queryKey: ['publication', variables.publicationId]
      });

      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
    },
    
    onError: (error: AxiosError<ErrorResponse>, variables) => {
      console.error('❌ Error deleting review:', error);
      console.error('Data that failed to delete:', {
        publicationId: variables.publicationId,
        reviewerEmail: variables.reviewerEmail,
      });

      let title = "Error";
      let description = "Failed to delete review. Please try again.";

      if (error.response) {
        const status = error.response.status;
        console.error('Status code:', status);
        console.error('Response data:', error.response.data);

        if (status === 404) {
          title = "Review not found";
          description = "The review you're trying to delete doesn't exist.";
        } else if (status === 403) {
          title = "Access denied";
          description = "You don't have permission to delete this review.";
        } else if (status === 401) {
          title = "Unauthorized";
          description = "You must be logged in to delete a review.";
        } else if (status === 500) {
          description = "Server error. Please contact support.";
        } else {
          description = error.response.data?.message || description;
        }
      } else if (error.request) {
        description = "Could not connect to server. Check your connection.";
      } else {
        description = error.message || "Unknown error occurred.";
      }

      toast({
        title: title,
        description: description,
        variant: "destructive",
      });
    },
  });
}