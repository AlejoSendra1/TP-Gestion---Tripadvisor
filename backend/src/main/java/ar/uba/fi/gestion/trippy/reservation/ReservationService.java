// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationResponseDTO;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;
    private final ReservationFactory reservationFactory;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
                              PublicationRepository publicationRepository,
                              UserRepository userRepository,
                              ReservationFactory reservationFactory) {
        this.reservationRepository = reservationRepository;
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
        this.reservationFactory = reservationFactory;
    }

    @Transactional
    public Reservation createReservation(Long publicationId, ReservationCreateDTO dto, String userEmail) {
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + publicationId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        if (!(user instanceof Traveler))
            throw new IllegalStateException("Solo Travelers pueden crear reservas.");

        if (pub.getHost() != null && pub.getHost().getEmail().equals(userEmail))
            throw new IllegalStateException("No podés reservar tu propia publicación.");

        Reservation reservation = reservationFactory.createForPublication(pub, user, dto);

        // Delegar validación a la instancia concreta antes de persistir
        reservation.validateCapacity(reservationRepository);

        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public ReservationResponseDTO getReservationById(Long reservationId, String userEmail) {
        // 1. Busca la reserva
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada: " + reservationId));

        // 2. Valida permisos
        // Solo el viajero que la creó o el host de la publicación pueden verla.
        if (!reservation.getTraveler().getEmail().equals(userEmail) &&
                !reservation.getPublication().getHost().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("No tienes permiso para ver esta reserva.");
        }

        // 3. Convierte al DTO que ya tienes
        return ReservationResponseDTO.from(reservation);
    }

    /**
     * Obtiene todas las reservas de un usuario específico.
     * Al ser @Transactional, evita la LazyInitializationException.
     */
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getMyReservations(String userEmail) {

        // 1. Buscar al usuario
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        // 2. Buscar sus reservas
        List<Reservation> reservations = reservationRepository.findByTravelerId(user.getId());

        // 3. Convertir a DTOs (la sesión sigue abierta aquí)
        return reservations.stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());
    }
}
