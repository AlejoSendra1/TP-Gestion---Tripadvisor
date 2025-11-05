// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Hotel;
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
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
                              PublicationRepository publicationRepository,
                              UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Reservation createReservation(Long publicationId, ReservationCreateDTO dto, String userEmail) {
        System.out.println("se esta creando la reservation");
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + publicationId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        if (!(user instanceof Traveler traveler))
            throw new IllegalStateException("Solo Travelers pueden crear reservas.");

        if (pub.getHost() != null && pub.getHost().getEmail().equals(userEmail))
            throw new IllegalStateException("No podés reservar tu propia publicación.");

        // Normalizar nuevas fechas (si no vienen, intentar con dateTime)
        LocalDateTime newStart = null;
        LocalDateTime newEnd = null;
        if (dto.startDate() != null) {
            newStart = dto.startDate().atStartOfDay();
            newEnd = dto.endDate() != null ? dto.endDate().atStartOfDay() : newStart;
        } else if (dto.dateTime() != null) {
            newStart = dto.dateTime();
            newEnd = dto.dateTime();
        }

        // Validar solapamiento con reservas existentes de la misma publicación
        if (newStart != null && newEnd != null) {
            List<Reservation> existing = reservationRepository.findByPublicationId(publicationId)
                    .stream()
                    .filter(r -> r.getStatus() != ReservationStatus.CANCELLED) // <--- importante
                    .toList();
            for (Reservation ex : existing) {
                LocalDateTime exStart = ex.getStartDate();
                LocalDateTime exEnd = ex.getEndDate() != null ? ex.getEndDate() : exStart;
                if (exStart != null) {
                    // overlap si no (exEnd < newStart o exStart > newEnd)
                    boolean overlaps = !(exEnd.isBefore(newStart) || exStart.isAfter(newEnd));
                    if (overlaps) {
                        throw new IllegalStateException("La publicación ya tiene una reserva en las mismas fechas.");
                    }
                }
            }
        }

        Reservation r = new Reservation();
        r.setPublication(pub);
        r.setTraveler(traveler);

        if (dto.startDate() != null) r.setStartDate(dto.startDate().atStartOfDay());
        if (dto.endDate() != null) r.setEndDate(dto.endDate().atStartOfDay());

        if (dto.dateTime() != null) r.setReservationDate(dto.dateTime()); // si es null, @PrePersist lo llenará

        r.setGuestCount(dto.guests());
        r.setNotes(dto.additionalInfo());

        BigDecimal total;
        BigDecimal unitPrice = BigDecimal.valueOf(pub.getPrice());
        // Si es hotel -> calcular por dias, sino -> por cantidad de guests
        if (pub.getClass() == Hotel.class) { // TODO: hacerlo polimórfico
            long days = 1;
            if (r.getStartDate() != null && r.getEndDate() != null) {
                days += ChronoUnit.DAYS.between(r.getStartDate(), r.getEndDate());
                if (days <= 0) days = 1;
            }
            total = unitPrice.multiply(BigDecimal.valueOf(days));
        } else {
            int guests = Optional.ofNullable(r.getGuestCount()).orElse(1);
            total = unitPrice.multiply(BigDecimal.valueOf(guests));
        }
        r.setTotalPrice(total);
        System.out.println("se esta llegando al final de la reservation");

        return reservationRepository.save(r);
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
