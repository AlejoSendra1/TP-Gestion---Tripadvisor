package ar.uba.fi.gestion.trippy.payment.dto;

/**
 * DTO que devuelve la preferencia de pago al frontend.
 * Contiene el ID de la preferencia y la URL a la que se debe redirigir al usuario.
 */
public record PaymentPreferenceDTO(
        String preferenceId,
        String initPointUrl
) {}