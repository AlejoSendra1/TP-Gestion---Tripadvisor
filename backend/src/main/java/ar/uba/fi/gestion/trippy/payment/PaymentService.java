package ar.uba.fi.gestion.trippy.payment;

import ar.uba.fi.gestion.trippy.payment.dto.MercadoPagoWebhookDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentPreferenceDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentRequestDTO;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.reservation.ReservationRepository;
import ar.uba.fi.gestion.trippy.reservation.ReservationStatus; // <-- Necesitarás crear este Enum
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    // Repositorios y Servicios que necesitamos
    private final ReservationRepository reservationRepository;
    private final UserService userService;

    private final PreferenceClient preferenceClient;
    private final PaymentClient paymentClient;

    // URL de tu frontend (eventualmente, pon esto en application.properties)
    private final String FRONTEND_URL = "http://localhost:5173";

    // URL de tu API (¡IMPORTANTE! Debe ser pública para que MP te la pueda llamar)
    private final String API_URL = "https://tu-dominio-publico.com/api";


    @Autowired
    public PaymentService(ReservationRepository reservationRepository, UserService userService) {
        this.reservationRepository = reservationRepository;
        this.userService = userService;

        // Los clientes se inicializan automáticamente
        // gracias al @PostConstruct del MercadoPagoSetup
        this.preferenceClient = new PreferenceClient();
        this.paymentClient = new PaymentClient();
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
        // (Asumo que tienes un Enum ReservationStatus.PENDING)
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
                .unitPrice(reservation.getTotalPrice()) // Asumo que Reservation tiene este método
                .build();

        // 5. Configurar URLs de redirección
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
                    // ¡Clave! Guardamos el ID de nuestra reserva aquí
                    .externalReference(reservation.getId().toString())
                    // ¡Clave! Le decimos a MP dónde notificarnos
                    .notificationUrl(API_URL + "/payments/webhook")
                    .build();

            Preference preference = preferenceClient.create(preferenceRequest);

            return new PaymentPreferenceDTO(preference.getId(), preference.getInitPoint());

        } catch (MPApiException e) {
            System.err.println("Error al crear preferencia de MP: " + e.getApiResponse().getContent());
            throw new IllegalStateException("Error al comunicarse con Mercado Pago");
        } catch (Exception e) {
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

                // 4. Actualizamos el estado de nuestra reserva
                if (reservation.getStatus() == ReservationStatus.PENDING) {
                    reservation.setStatus(ReservationStatus.CONFIRMED); // Asumo Enum ReservationStatus.PAID
                    reservationRepository.save(reservation);

                    // 5. ¡GAMIFICACIÓN! Damos XP al usuario
                    // (Usamos el método que ya existe en tu UserService)
                    if (reservation.getTraveler() != null) {
                        userService.addXpForPurchase(
                                reservation.getTraveler().getEmail(),
                                reservation.getTotalPrice().doubleValue()
                        );
                    }
                }
                // Si ya estaba PAID, no hacemos nada (MP puede enviar webhooks duplicados)
            }
            // (Opcional) Podrías manejar "rejected" y "cancelled" para actualizar tu reserva

        } catch (MPApiException e) {
            System.err.println("Error de MP al buscar pago " + paymentIdStr + ": " + e.getApiResponse().getContent());
        } catch (Exception e) {
            System.err.println("Error al procesar webhook para pago " + paymentIdStr + ": " + e.getMessage());
        }
    }
}