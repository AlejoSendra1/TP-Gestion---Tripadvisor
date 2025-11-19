import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from 'axios';

interface DeleteReservationParams {
  reservationId: string;
  publicationId: string;
}

type ErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reservationId, publicationId }: DeleteReservationParams) => {
      console.log("Canceling reservation:", { reservationId, publicationId });
      
      const response = await apiClient.delete(
        `/publications/${publicationId}/reservations/${reservationId}`
      );

      return { reservationId };
    },
    
    onSuccess: (data, variables) => {
      console.log("✅ Reservation cancellation successful");

      // Invalidar las queries de reservas para que se recarguen
      queryClient.invalidateQueries({
        queryKey: ['reservations'],
        exact: false
      });
      
      // También podrías invalidar queries específicas si las tienes
      queryClient.invalidateQueries({
        queryKey: ['userReservations']
      });

      toast({
        title: "Reserva cancelada",
        description: "Tu reserva ha sido cancelada exitosamente.",
      });
    },
    
    onError: (error: AxiosError<ErrorResponse>, variables) => {
      console.error('❌ Error canceling reservation:', error);
      console.error('Reservation that failed to cancel:', {
        reservationId: variables.reservationId,
      });

      let title = "Error";
      let description = "No se pudo cancelar la reserva. Por favor, intenta nuevamente.";

      if (error.response) {
        const status = error.response.status;
        console.error('Status code:', status);
        console.error('Response data:', error.response.data);

        if (status === 404) {
          title = "Reserva no encontrada";
          description = "La reserva que intentas cancelar no existe.";
        } else if (status === 403) {
          title = "Acceso denegado";
          description = "No tienes permiso para cancelar esta reserva.";
        } else if (status === 401) {
          title = "No autorizado";
          description = "Debes iniciar sesión para cancelar una reserva.";
        } else if (status === 400) {
          title = "No se puede cancelar";
          description = error.response.data?.message || "Esta reserva no puede ser cancelada en este momento.";
        } else if (status === 500) {
          description = "Error del servidor. Por favor, contacta con soporte.";
        } else {
          description = error.response.data?.message || description;
        }
      } else if (error.request) {
        description = "No se pudo conectar al servidor. Revisa tu conexión.";
      } else {
        description = error.message || "Ocurrió un error desconocido.";
      }

      toast({
        title: title,
        description: description,
        variant: "destructive",
      });
    },
  });
}