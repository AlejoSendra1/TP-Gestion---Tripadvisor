// language: java
package ar.uba.fi.gestion.trippy.payment;

import ar.uba.fi.gestion.trippy.payment.dto.MercadoPagoWebhookDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentPreferenceDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentRequestDTO;
import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.reservation.ReservationRepository;
import ar.uba.fi.gestion.trippy.reservation.ReservationStatus;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.UserService;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.net.MPResponse;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private ReservationRepository reservationRepositoryMock;
    @Mock
    private UserService userServiceMock;
    @Mock
    private PreferenceClient preferenceClientMock;
    @Mock
    private PaymentClient paymentClientMock;

    @InjectMocks
    private PaymentService paymentService;

    // --- Mocks ---
    private Traveler mockTraveler;
    private Publication mockPublication;
    private Reservation mockReservation;
    private PaymentRequestDTO paymentRequest;
    private String travelerEmail = "traveler@test.com";

    @BeforeEach
    void setUp() {

        mockTraveler = mock(Traveler.class);
        lenient().when(mockTraveler.getId()).thenReturn(1L);
        lenient().when(mockTraveler.getEmail()).thenReturn(travelerEmail);

        mockPublication = mock(Publication.class);
        lenient().when(mockPublication.getId()).thenReturn(10L);
        lenient().when(mockPublication.getTitle()).thenReturn("Hotel Test");

        mockReservation = mock(Reservation.class);
        lenient().when(mockReservation.getId()).thenReturn(1L);
        lenient().when(mockReservation.getTraveler()).thenReturn(mockTraveler);
        lenient().when(mockReservation.getPublication()).thenReturn(mockPublication);
        lenient().when(mockReservation.getStatus()).thenReturn(ReservationStatus.PENDING);
        lenient().when(mockReservation.getTotalPrice()).thenReturn(new BigDecimal("1000.00"));

        paymentRequest = new PaymentRequestDTO(1L);

        // Esta es la otra línea clave
        paymentService = new PaymentService(
                reservationRepositoryMock,
                userServiceMock,
                preferenceClientMock,
                paymentClientMock
        );
    }

    // --- Tests createPreference ---

    @Test
    void whenCreatePreference_asOwner_shouldReturnPreferenceDTO() throws Exception {
        // Arrange
        when(reservationRepositoryMock.findById(1L)).thenReturn(Optional.of(mockReservation));

        Preference mockPreference = mock(Preference.class);
        when(mockPreference.getId()).thenReturn("pref-123");
        when(mockPreference.getInitPoint()).thenReturn("http://mp.com/pay");

        when(preferenceClientMock.create(any(PreferenceRequest.class))).thenReturn(mockPreference);

        // Act
        PaymentPreferenceDTO result = paymentService.createPreference(paymentRequest, travelerEmail);

        // Assert
        assertThat(result.preferenceId()).isEqualTo("pref-123");
        assertThat(result.initPointUrl()).isEqualTo("http://mp.com/pay");
        verify(preferenceClientMock).create(any(PreferenceRequest.class));
    }

    @Test
    void whenCreatePreference_forNonExistentReservation_shouldThrowException() {
        // Arrange
        when(reservationRepositoryMock.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> {
            paymentService.createPreference(paymentRequest, travelerEmail);
        })
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Reserva no encontrada");
    }

    @Test
    void whenCreatePreference_asWrongUser_shouldThrowException() {
        // Arrange
        when(reservationRepositoryMock.findById(1L)).thenReturn(Optional.of(mockReservation));
        String wrongEmail = "attacker@test.com";

        // Act & Assert
        assertThatThrownBy(() -> {
            paymentService.createPreference(paymentRequest, wrongEmail);
        })
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No tenés permisos");
    }

    @Test
    void whenCreatePreference_forAlreadyPaidReservation_shouldThrowException() {
        // Arrange
        // Sobreescribimos el stub de status SÓLO para este test
        when(mockReservation.getStatus()).thenReturn(ReservationStatus.CONFIRMED);
        when(reservationRepositoryMock.findById(1L)).thenReturn(Optional.of(mockReservation));

        // Act & Assert
        assertThatThrownBy(() -> {
            paymentService.createPreference(paymentRequest, travelerEmail);
        })
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Esta reserva ya fue pagada");
    }

    @Test
    void whenCreatePreference_andMPFails_shouldThrowException() throws Exception {
        // Arrange
        when(reservationRepositoryMock.findById(1L)).thenReturn(Optional.of(mockReservation));

        // --- ¡AQUÍ ESTÁ LA MAGIA! ---
        // 1. Creamos un mock para la "respuesta" de la API
        MPResponse mockResponse = mock(MPResponse.class);
        when(mockResponse.getContent()).thenReturn("{\"message\":\"Mock API error\"}");

        // 2. Creamos el mock para la "Excepción"
        MPApiException mockException = mock(MPApiException.class);
        // 3. Le decimos que cuando le pidan la "respuesta", devuelva nuestro mock de arriba
        when(mockException.getApiResponse()).thenReturn(mockResponse);

        // 4. Le decimos al cliente que lance ESTA excepción "inteligente"
        when(preferenceClientMock.create(any(PreferenceRequest.class)))
                .thenThrow(mockException);
        // --- FIN DE LA MAGIA ---

        // Act & Assert
        // (Esto queda igual)
        assertThatThrownBy(() -> {
            paymentService.createPreference(paymentRequest, travelerEmail);
        })
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Error al comunicarse con Mercado Pago");
    }

    // --- Tests handleWebhookNotification ---

    @Test
    void whenWebhookReceived_forApprovedPayment_shouldUpdateReservationAndAddXp() throws Exception {
        // Arrange
        MercadoPagoWebhookDTO webhook = new MercadoPagoWebhookDTO("payment", null, Map.of("id", "12345"));

        Payment mockPayment = mock(Payment.class);
        when(mockPayment.getStatus()).thenReturn("approved");
        when(mockPayment.getExternalReference()).thenReturn("1"); // ID de nuestra reserva

        when(paymentClientMock.get(12345L)).thenReturn(mockPayment);
        // Usamos el mockReservation global (que por defecto devuelve PENDING)
        when(reservationRepositoryMock.findById(1L)).thenReturn(Optional.of(mockReservation));

        // Act
        paymentService.handleWebhookNotification(webhook);

        // Assert
        // Verificamos que el servicio haya llamado al *setter* de nuestro mock
        verify(mockReservation).setStatus(ReservationStatus.CONFIRMED);
        verify(reservationRepositoryMock).save(mockReservation);

        // Verificamos que se llame a la gamificación
        verify(userServiceMock).addXpForPurchase(travelerEmail, 1000.00);
    }

    @Test
    void whenWebhookReceived_forRejectedPayment_shouldNotUpdateReservation() throws Exception {
        // Arrange
        MercadoPagoWebhookDTO webhook = new MercadoPagoWebhookDTO("payment", null, Map.of("id", "12345"));

        Payment mockPayment = mock(Payment.class);
        when(mockPayment.getStatus()).thenReturn("rejected");

        when(paymentClientMock.get(12345L)).thenReturn(mockPayment);

        // Act
        paymentService.handleWebhookNotification(webhook);

        // Assert
        // Verificamos que NUNCA se llame al setter de status
        verify(mockReservation, never()).setStatus(any(ReservationStatus.class));
        verify(reservationRepositoryMock, never()).save(any());
        verify(userServiceMock, never()).addXpForPurchase(anyString(), anyDouble());
    }

    @Test
    void whenWebhookReceived_forAlreadyConfirmedReservation_shouldDoNothing() throws Exception {
        // Arrange
        // Sobreescribimos el stub SÓLO para este test
        when(mockReservation.getStatus()).thenReturn(ReservationStatus.CONFIRMED); // Ya estaba confirmada

        MercadoPagoWebhookDTO webhook = new MercadoPagoWebhookDTO("payment", null, Map.of("id", "12345"));
        Payment mockPayment = mock(Payment.class);
        when(mockPayment.getStatus()).thenReturn("approved");
        when(mockPayment.getExternalReference()).thenReturn("1");

        when(paymentClientMock.get(12345L)).thenReturn(mockPayment);
        when(reservationRepositoryMock.findById(1L)).thenReturn(Optional.of(mockReservation));

        // Act
        paymentService.handleWebhookNotification(webhook);

        // Assert
        verify(mockReservation, never()).setStatus(any(ReservationStatus.class));
        verify(reservationRepositoryMock, never()).save(any());
        verify(userServiceMock, never()).addXpForPurchase(anyString(), anyDouble());
    }

    @Test
    void whenWebhookReceived_withNoPaymentId_shouldDoNothing() throws Exception {
        // Arrange
        MercadoPagoWebhookDTO webhook = new MercadoPagoWebhookDTO("payment", null, Map.of()); // Sin ID

        // Act
        paymentService.handleWebhookNotification(webhook);

        // Assert
        verify(paymentClientMock, never()).get(anyLong());
        verify(reservationRepositoryMock, never()).save(any());
    }
}