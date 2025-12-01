package ar.uba.fi.gestion.trippy.payment;

import ar.uba.fi.gestion.trippy.config.security.JwtService;
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.config.security.SecurityConfig;
import ar.uba.fi.gestion.trippy.payment.dto.MercadoPagoWebhookDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentPreferenceDTO;
import ar.uba.fi.gestion.trippy.payment.dto.PaymentRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentRestController.class)
@Import(SecurityConfig.class) // Carga tu SecurityConfig real
public class PaymentRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PaymentService paymentServiceMock;

    @Autowired
    private JwtService jwtServiceMock;

    @TestConfiguration
    static class ControllerTestConfig {
        @Bean
        public PaymentService paymentService() {
            return Mockito.mock(PaymentService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }
    }

    // --- Variables de prueba ---
    private String travelerEmail = "traveler@test.com";
    private String travelerToken = "TOKEN_VALIDO_TRAVELER";
    private JwtUserDetails travelerDetails = new JwtUserDetails(travelerEmail, "USER"); // Rol "USER"

    private PaymentRequestDTO paymentRequest;
    private PaymentPreferenceDTO paymentPreference;

    @BeforeEach
    void setUp() {
        Mockito.reset(paymentServiceMock, jwtServiceMock);

        paymentRequest = new PaymentRequestDTO(1L);

        paymentPreference = new PaymentPreferenceDTO(
                "pref-123", "http://mp.com/pay"
        );

        // --- Mock de Seguridad (JWT Service) ---
        when(jwtServiceMock.extractVerifiedUserDetails(travelerToken))
                .thenReturn(Optional.of(travelerDetails));
    }

    // --- Tests POST /api/payments/create-preference ---

    @Test
    void whenCreatePreference_asAuthenticatedUser_shouldReturn200() throws Exception {
        // Arrange
        when(paymentServiceMock.createPreference(any(PaymentRequestDTO.class), eq(travelerEmail)))
                .thenReturn(paymentPreference);

        // Act & Assert
        mockMvc.perform(post("/api/payments/create-preference")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferenceId", is("pref-123")))
                .andExpect(jsonPath("$.initPointUrl", is("http://mp.com/pay")));
    }

    @Test
    void whenCreatePreference_unauthenticated_shouldReturn401() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/payments/create-preference")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void whenCreatePreference_withNonExistentReservation_shouldReturn404() throws Exception {
        // Arrange
        when(paymentServiceMock.createPreference(any(), eq(travelerEmail)))
                .thenThrow(new EntityNotFoundException("Reserva no encontrada"));

        // Act & Assert
        mockMvc.perform(post("/api/payments/create-preference")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    void whenCreatePreference_forSomeoneElsesReservation_shouldReturn403() throws Exception {
        // Arrange
        when(paymentServiceMock.createPreference(any(), eq(travelerEmail)))
                .thenThrow(new IllegalStateException("No tenés permisos para pagar esta reserva"));

        // Act & Assert
        mockMvc.perform(post("/api/payments/create-preference")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isForbidden()); // Gracias al @ExceptionHandler
    }

    // --- Tests POST /api/payments/webhook ---

    @Test
    void whenWebhookIsCalled_shouldReturn200() throws Exception {
        // Arrange
        MercadoPagoWebhookDTO webhook = new MercadoPagoWebhookDTO(
                "payment", null, Map.of("id", "12345")
        );

        doNothing().when(paymentServiceMock).handleWebhookNotification(any(MercadoPagoWebhookDTO.class));

        // Act & Assert
        mockMvc.perform(post("/api/payments/webhook") // Endpoint público, sin token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(webhook)))
                .andExpect(status().isOk());
    }
}