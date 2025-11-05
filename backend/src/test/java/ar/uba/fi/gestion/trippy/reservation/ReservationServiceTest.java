// language: java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Hotel;
import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.user.BusinessOwner;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PublicationRepository publicationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReservationService reservationService;

    private Publication hotelPub;
    private Traveler mockTraveler;
    private String travelerEmail = "traveler@test.com";

    @BeforeEach
    void setUp() {
        hotelPub = new Hotel();
        hotelPub.setPrice(100.0);
        // host null -> permite reservar (evita validación de owner)

        // Usar una instancia real en lugar de mock para evitar inline-mocks / ByteBuddy issues
        mockTraveler = new Traveler(travelerEmail, "pass", "Test", "Traveler");
    }

    @Test
    void whenCreateReservation_asTravelerForHotel_shouldComputeTotalAndSave() {
        // Arrange
        long pubId = 1L;
        LocalDate start = LocalDate.now().plusDays(1);
        ReservationCreateDTO dto = new ReservationCreateDTO(start, start.plusDays(2), null, 2, "Notas", BigDecimal.valueOf(300));

        when(publicationRepository.findById(pubId)).thenReturn(Optional.of(hotelPub));
        when(userRepository.findByEmail(travelerEmail)).thenReturn(Optional.of(mockTraveler));
        when(reservationRepository.findByPublicationId(pubId)).thenReturn(List.of());
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Reservation saved = reservationService.createReservation(pubId, dto, travelerEmail);

        // Assert
        assertThat(saved).isNotNull();
        assertThat(saved.getStartDate()).isNotNull();
        assertThat(saved.getTotalPrice()).isNotNull();
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void whenCreateReservation_overlap_shouldThrow() {
        // Arrange
        long pubId = 2L;
        LocalDate start = LocalDate.now().plusDays(5);
        ReservationCreateDTO dto = new ReservationCreateDTO(start, start, null, 1, null, null);

        when(publicationRepository.findById(pubId)).thenReturn(Optional.of(hotelPub));
        when(userRepository.findByEmail(travelerEmail)).thenReturn(Optional.of(mockTraveler));

        // existing reservation that overlaps
        Reservation existing = new Reservation();
        existing.setStartDate(start.atStartOfDay());
        existing.setEndDate(start.atStartOfDay());
        when(reservationRepository.findByPublicationId(pubId)).thenReturn(List.of(existing));

        // Act & Assert
        assertThatThrownBy(() -> reservationService.createReservation(pubId, dto, travelerEmail))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ya tiene una reserva");
    }

    @Test
    void whenCreateReservation_asOwner_shouldThrow() {
        // Arrange
        long pubId = 3L;
        Publication pub = new Hotel();
        var host = new BusinessOwner("owner@test.com", "pass", "Test", "Traveler");
        pub.setHost(host);

        ReservationCreateDTO dto = new ReservationCreateDTO(LocalDate.now().plusDays(1), null, null, 1, null, null);
        when(publicationRepository.findById(pubId)).thenReturn(Optional.of(pub));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(host)); // not a Traveler

        // Act & Assert
        assertThatThrownBy(() -> reservationService.createReservation(pubId, dto, "owner@test.com"))
                .isInstanceOf(IllegalStateException.class);
    }
}
