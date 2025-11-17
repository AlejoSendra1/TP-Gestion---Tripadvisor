// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
    public List<Reservation> getReservationsForTraveler(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        if (!(user instanceof Traveler traveler))
            throw new IllegalStateException("Solo los viajeros pueden tener reservas");

        return reservationRepository.findByTravelerId(traveler.getId());
    }

    @Transactional
    public Reservation cancelReservation(Long publicationId, Long reservationId, String userEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada: " + reservationId));

        if (!reservation.getPublication().getId().equals(publicationId))
            throw new IllegalStateException("La reserva no pertenece a esta publicación.");

        if (!reservation.getTraveler().getEmail().equals(userEmail))
            throw new SecurityException("No tenés permiso para cancelar esta reserva.");

        reservation.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }







}
