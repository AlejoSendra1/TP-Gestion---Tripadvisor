// src/hooks/useCreateReview.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from 'axios';

type CreateReviewInput = {
  publicationId: string;
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

async function createReview(data: CreateReviewInput): Promise<ReviewResponse> {
  try {
    const response = await apiClient.post("/reviews", {
      publicationId: data.publicationId, // Convert to number
      userEmail: data.reviewerEmail,
      rating: data.rating,
      reviewContent: data.reviewContent,
    });
    // 2. Si la petición es exitosa:
    const data = response.data;
    console.log("Registro exitoso:", data);
    toast({ title: "¡Gracias por tu opinion!", description: "El resto de usuarios podra ver lo que has escrito" });
    return data;
  } catch (err) {
    // 3. Manejo de errores de Axios
    const error = err as Error | AxiosError;
    console.error("enviado:  ", {       publicationId: data.publicationId, // Convert to number
                                        userEmail: data.reviewerEmail,
                                        rating: data.rating,
                                        reviewContent: data.reviewContent,
                                      })
    console.error('Error al publicar comentario:', error.message);

    let title = "Error al publicar comentario";
    let description = "Ocurrió un error inesperado. Intenta de nuevo.";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // El backend respondió con un error
        if (error.response.status === 409) {
          title = "Email en uso";
          description = "Ese email ya está registrado. Prueba con otro.";
        } else if (error.response.status === 400) { // 400 Bad Request
          description = "Datos inválidos. Revisa el formulario.";
        } else if (error.response.status === 500) {
          description = "Error interno del servidor. Contacta a soporte.";
        }
      } else if (error.request) {
        description = "No se pudo conectar con el servidor.";
      }
    }

    // Mostramos el error
    toast({
      title: title,
      description: description,
      variant: "destructive",
    });
  }
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (data, variables) => {
      // Invalidate the publication detail query to refetch with new review
      queryClient.invalidateQueries({
        queryKey: ['publication', variables.publicationId]
      });

      toast({
        title: '✅ Review submitted!',
        description: `You earned 50 XP for sharing your experience!`,
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      let errorMessage = 'Failed to submit review. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'You already reviewed this restaurant. You can edit your existing review instead.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Restaurant not found.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid review data. Please check your input.';
      }

      toast({
        title: '❌ Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}