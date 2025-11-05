package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.reservation.dto.DailyAvailabilityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/publications")
public class ReservationAvailabilityController {

    private final ReservationRepository reservationRepository;
    private final PublicationRepository publicationRepository;

    @Autowired
    public ReservationAvailabilityController(ReservationRepository reservationRepository,
                                             PublicationRepository publicationRepository) {
        this.reservationRepository = reservationRepository;
        this.publicationRepository = publicationRepository;
    }

    @GetMapping("/{publicationId}/availability/days")
    public ResponseEntity<List<DailyAvailabilityDTO>> getNext30DaysAvailability(@PathVariable Long publicationId) {
        if (!publicationRepository.existsById(publicationId)) {
            return ResponseEntity.notFound().build();
        }

        LocalDate today = LocalDate.now();
        LocalDate windowEndDate = today.plusDays(29); // próximos 30 días incluyendo hoy
        LocalDateTime windowStart = today.atStartOfDay();
        LocalDateTime windowEnd = windowEndDate.atStartOfDay();

        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(publicationId, windowStart, windowEnd);

        // construir conjunto de días ocupados
        Set<LocalDate> booked = new HashSet<>();
        for (Reservation r : overlapping) {
            if (r.getStartDate() == null) continue;
            LocalDate start = r.getStartDate().toLocalDate();
            LocalDate end = r.getEndDate() != null ? r.getEndDate().toLocalDate() : start;

            // acotar al rango de ventana
            LocalDate s = start.isBefore(today) ? today : start;
            LocalDate e = end.isAfter(windowEndDate) ? windowEndDate : end;
            for (LocalDate d = s; !d.isAfter(e); d = d.plusDays(1)) {
                booked.add(d);
            }
        }

        List<DailyAvailabilityDTO> result = new ArrayList<>(30);
        for (int i = 0; i < 30; i++) {
            LocalDate d = today.plusDays(i);
            result.add(new DailyAvailabilityDTO(d, !booked.contains(d)));
        }

        return ResponseEntity.ok(result);
    }
}
