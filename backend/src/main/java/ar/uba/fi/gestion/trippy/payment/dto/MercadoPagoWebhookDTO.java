package ar.uba.fi.gestion.trippy.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * DTO para deserializar la notificación de Webhook de Mercado Pago.
 * Nos interesa principalmente el "topic" y el "id" del recurso.
 */
public record MercadoPagoWebhookDTO(
        String topic,
        String resource,

        // A veces MP envía el ID dentro de un objeto "data"
        @JsonProperty("data")
        Map<String, String> data
) {
    /**
     * Helper para obtener el ID del pago, sin importar el formato del webhook.
     */
    public String getPaymentId() {
        if ("payment".equals(topic) && resource != null) {
            // Formato: "resource": "https://api.mercadopago.com/v1/payments/12345"
            String[] parts = resource.split("/");
            return parts[parts.length - 1];
        }

        if (data != null && data.containsKey("id")) {
            // Formato: "data": { "id": "12345" }
            return data.get("id");
        }

        return null;
    }
}