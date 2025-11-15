package ar.uba.fi.gestion.trippy.payment;

import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.payment.dto.MercadoPagoWebhookDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentPreferenceDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments") // Usamos /api/ para consistencia
@Tag(name = "7 - Payments") // Un nuevo tag para Swagger
public class PaymentRestController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentRestController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Endpoint para crear una preferencia de pago en Mercado Pago.
     * El usuario debe estar autenticado.
     */
    @PostMapping("/create-preference")
    @PreAuthorize("isAuthenticated()") // Aseguramos que el usuario esté logueado
    @Operation(summary = "Crear una preferencia de pago")
    @ApiResponse(responseCode = "200", description = "Preferencia creada, devuelve URL de pago")
    @ApiResponse(responseCode = "403", description = "No tiene permisos para pagar esta reserva")
    @ApiResponse(responseCode = "404", description = "Reserva no encontrada")
    public ResponseEntity<PaymentPreferenceDTO> createPaymentPreference(
            @Valid @RequestBody PaymentRequestDTO paymentRequest,
            @AuthenticationPrincipal JwtUserDetails authenticatedUser
    ) {
        String userEmail = authenticatedUser.username();
        PaymentPreferenceDTO preference = paymentService.createPreference(paymentRequest, userEmail);
        return ResponseEntity.ok(preference);
    }

    /**
     * Endpoint para recibir Webhooks de Mercado Pago.
     * ¡Este endpoint DEBE ser público!
     */
    @PostMapping("/webhook")
    @Operation(summary = "Recibir notificaciones de Mercado Pago (Webhook)")
    @ApiResponse(responseCode = "200", description = "Notificación recibida")
    public ResponseEntity<Void> handleMercadoPagoWebhook(
            @RequestBody MercadoPagoWebhookDTO notification
    ) {
        // El servicio procesará la notificación
        paymentService.handleWebhookNotification(notification);

        // Respondemos 200 OK a MP para que sepa que recibimos la notificación
        return ResponseEntity.ok().build();
    }


    // --- Manejadores de Excepciones (copiados de tus otros controllers) ---

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleForbidden(IllegalStateException ex) {
        // Esta excepción la usaremos para "No podés pagar esto"
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }
}