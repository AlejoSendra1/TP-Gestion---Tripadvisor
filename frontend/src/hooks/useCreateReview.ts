import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from 'axios';

type CreateReviewInput = {
  publicationId: number;
  reviewerEmail: string;
  rating: number;
  reviewContent: string;
};

type ReviewResponse = {
  username: string;
  rating: number;
  reviewContent: string;
};

type ErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

// Simple async function - just throw errors, don't handle them here
async function createReview(input: CreateReviewInput): Promise<ReviewResponse> {
  console.log("Sending review:", {
    publicationId: Number(input.publicationId),
    reviewerEmail: input.reviewerEmail,
    rating: Number(input.rating),
    reviewContent: input.reviewContent,
  });

  const response = await apiClient.post<ReviewResponse>("/reviews", {
    publicationId: Number(input.publicationId),
    reviewerEmail: input.reviewerEmail,
    rating: Number(input.rating),
    reviewContent: input.reviewContent,
  });

  console.log("Review created successfully:", response.data);
  return response.data;
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createReview,

    onSuccess: (data, variables) => {
      console.log("✅ Review submission successful:", data);

      // Invalidate the publication detail query to refetch with new review
      queryClient.invalidateQueries({
        queryKey: ['publication', variables.publicationId]
      });
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.publicationId]  // ← Add this!
      });

      toast({
        title: '✅ ¡Reseña enviada!',
        description: `¡Ganaste 50 XP por compartir tu experiencia!`,
      });
    },

    onError: (error: AxiosError<ErrorResponse>, variables) => {
      console.error('❌ Error al publicar comentario:', error);
      console.error('Datos que intentaste enviar:', {
        publicationId: variables.publicationId,
        userEmail: variables.reviewerEmail,
        rating: variables.rating,
        reviewContent: variables.reviewContent,
      });

      let title = "Error al publicar comentario";
      let description = "Ocurrió un error inesperado. Intenta de nuevo.";

      if (error.response) {
        const status = error.response.status;
        console.error('Status code:', status);
        console.error('Response data:', error.response.data);

        if (status === 409) {
          title = "Ya comentaste";
          description = "Ya has dejado una reseña en esta publicación.";
        } else if (status === 400) {
          description = error.response.data?.message || "Datos inválidos. Revisa el formulario.";
        } else if (status === 404) {
          description = "Publicación no encontrada.";
        } else if (status === 401) {
          title = "No autorizado";
          description = "Debes iniciar sesión para comentar.";
        } else if (status === 403) {
          title = "Acceso denegado";
          description = "No tienes permisos para realizar esta acción.";
        } else if (status === 500) {
          description = "Error interno del servidor. Contacta a soporte.";
        }
      } else if (error.request) {
        description = "No se pudo conectar con el servidor. Verifica tu conexión.";
      } else {
        description = error.message || "Error desconocido.";
      }

      toast({
        title: title,
        description: description,
        variant: "destructive",
      });
    },
  });
}