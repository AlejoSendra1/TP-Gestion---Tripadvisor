// language: java
package ar.uba.fi.gestion.trippy.payment;

import ar.uba.fi.gestion.trippy.payment.dto.MercadoPagoWebhookDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentPreferenceDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentRequestDTO;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.reservation.ReservationRepository;
import ar.uba.fi.gestion.trippy.reservation.ReservationStatus;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.UserService;

// Imports de Mercado Pago SDK
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // <-- Importado para inyectar propiedades
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    // Repositorios y Servicios que necesitamos
    private final ReservationRepository reservationRepository;
    private final UserService userService;

    // Clientes de Mercado Pago (inyectados)
    private final PreferenceClient preferenceClient;
    private final PaymentClient paymentClient;

    // --- URLs Externalizadas ---
    // Estas variables se cargan desde application.properties
    // o se sobreescriben con variables de entorno en Docker.
    private final String FRONTEND_URL;
    private final String API_URL;

    @Autowired
    public PaymentService(
            ReservationRepository reservationRepository,
            UserService userService,
            PreferenceClient preferenceClient,
            PaymentClient paymentClient,
            // Inyectamos los valores desde el archivo .properties
            @Value("${trippy.frontend.url}") String frontendUrl,
            @Value("${trippy.api.base-url}") String apiUrl
    ) {
        this.reservationRepository = reservationRepository;
        this.userService = userService;
        this.preferenceClient = preferenceClient;
        this.paymentClient = paymentClient;

        // Asignamos las URLs inyectadas
        this.FRONTEND_URL = frontendUrl;
        this.API_URL = apiUrl;
    }

    /**
     * Crea una preferencia de pago para una reserva específica.
     */
    @Transactional(readOnly = true)
    public PaymentPreferenceDTO createPreference(PaymentRequestDTO request, String userEmail) {

        // 1. Buscar la reserva
        Reservation reservation = reservationRepository.findById(request.reservationId())
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada"));

        // 2. Validar permisos
        if (reservation.getTraveler() == null || !reservation.getTraveler().getEmail().equals(userEmail)) {
            throw new IllegalStateException("No tenés permisos para pagar esta reserva.");
        }

        // 3. Validar estado de la reserva
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new IllegalStateException("Esta reserva ya fue pagada o está cancelada.");
        }

        // 4. Crear el ítem para Mercado Pago
        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .id(reservation.getPublication().getId().toString())
                .title(reservation.getPublication().getTitle())
                .description("Reserva en Trippy")
                .quantity(1) // Siempre es 1 ítem (la reserva completa)
                .currencyId("ARS")
                .unitPrice(reservation.getTotalPrice())
                .build();

        // 5. Configurar URLs de redirección (usando la variable inyectada)
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(FRONTEND_URL + "/payment/success")
                .failure(FRONTEND_URL + "/payment/failure")
                .pending(FRONTEND_URL + "/payment/pending")
                .build();

        // 6. Crear la preferencia
        try {
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(List.of(itemRequest))
                    .backUrls(backUrls)
                    // Forzamos la redirección automática al frontend
//                    .autoReturn("approved")
                    // Guardamos nuestro ID de reserva para el webhook
                    .externalReference(reservation.getId().toString())
                    // Le decimos a MP dónde notificarnos (usando la variable inyectada)
                    .notificationUrl(API_URL + "/payments/webhook")
                    .build();

            Preference preference = preferenceClient.create(preferenceRequest);

            return new PaymentPreferenceDTO(preference.getId(), preference.getInitPoint());

        } catch (MPApiException e) {
            System.err.println("Error al crear preferencia de MP: " + e.getApiResponse().getContent());
            throw new IllegalStateException("Error al comunicarse con Mercado Pago");
        } catch (Exception e) {
            System.err.println("Error inesperado en createPreference: " + e.getMessage());
            throw new IllegalStateException("Error inesperado: " + e.getMessage());
        }
    }

    /**
     * Procesa una notificación de Webhook de Mercado Pago.
     */
    @Transactional // ¡Muy importante! Modifica la base de datos.
    public void handleWebhookNotification(MercadoPagoWebhookDTO notification) {

        String paymentIdStr = notification.getPaymentId();

        if (paymentIdStr == null) {
            System.out.println("Webhook recibido sin ID de pago. Tema: " + notification.topic());
            return; // No podemos procesar nada
        }

        try {
            // 1. Con el ID, pedimos a MP los datos completos del pago
            Payment payment = paymentClient.get(Long.parseLong(paymentIdStr));

            // 2. Verificamos si el pago fue aprobado
            if ("approved".equals(payment.getStatus())) {

                // 3. Obtenemos nuestro ID de reserva (el que guardamos en external_reference)
                String reservationIdStr = payment.getExternalReference();
                if (reservationIdStr == null) {
                    System.err.println("Pago " + paymentIdStr + " aprobado pero sin external_reference!");
                    return;
                }

                Long reservationId = Long.parseLong(reservationIdStr);
                Reservation reservation = reservationRepository.findById(reservationId)
                        .orElseThrow(() -> new EntityNotFoundException("Webhook para reserva " + reservationId + " no encontrada"));

                // 4. Actualizamos el estado de nuestra reserva (¡Idempotente!)
                if (reservation.getStatus() == ReservationStatus.PENDING) {
                    reservation.setStatus(ReservationStatus.CONFIRMED); // aca agregar el 
                    reservationRepository.save(reservation);

                    // 5. ¡GAMIFICACIÓN! Damos XP al usuario
                    userService.addXpForPurchase(
                            reservation.getTraveler().getEmail(),
                            reservation.getTotalPrice().doubleValue()
                    );
                    Traveler traveler = (Traveler) reservation.getTraveler();
                    BigDecimal coins = reservation.getTotalPrice().multiply(new BigDecimal("0.1"));
                    traveler.addTrippyCoins(coins.intValue());


                }
                // Si ya estaba CONFIRMED, no hacemos nada (MP puede enviar webhooks duplicados)
            }
            // (Opcional) Podrías manejar "rejected" y "cancelled" para actualizar tu reserva

        } catch (MPApiException e) {
            System.err.println("Error de MP al buscar pago " + paymentIdStr + ": " + e.getApiResponse().getContent());
        } catch (Exception e) {
            System.err.println("Error al procesar webhook para pago " + paymentIdStr + ": " + e.getMessage());
        }
    }
}