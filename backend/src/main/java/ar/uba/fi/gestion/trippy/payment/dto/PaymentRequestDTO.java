package ar.uba.fi.gestion.trippy.payment.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO para solicitar la creación de una preferencia de pago.
 * El frontend solo necesita enviar el ID de la reserva que quiere pagar.
 */
public record PaymentRequestDTO(
        @NotNull
        Long reservationId
) {}