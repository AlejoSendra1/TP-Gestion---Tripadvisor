// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.*;
import ar.uba.fi.gestion.trippy.reservation.dto.DailyAvailabilityDTO;
import ar.uba.fi.gestion.trippy.reservation.dto.HourlyAvailabilityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

        Optional<Publication> maybe = publicationRepository.findById(publicationId);
        if (maybe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Publication pub = maybe.get();

        LocalDate start = LocalDate.now().plusDays(1); // desde mañana

        List<DailyAvailabilityDTO> result = new ArrayList<>(30);
        for (int i = 0; i < 30; i++) {
            LocalDate d = start.plusDays(i);
            boolean available = true;

            if (pub instanceof Hotel) {
                Hotel hotel = (Hotel) pub;
                int maxRooms = hotel.getRoomCount();
                Long already = reservationRepository.sumBookedRoomsForPublicationBetween(
                        publicationId, ReservationStatus.CONFIRMED, d, d);
                long booked = already != null ? already : 0L;
                available = booked < maxRooms;
            } else if (pub instanceof Coworking) {
                Coworking cw = (Coworking) pub;
                Integer capacity = cw.getCapacity();
                if (capacity == null) {
                    available = true;
                } else {
                    Long already = reservationRepository.sumGuestsForCoworkingForPublicationBetween(
                            publicationId, ReservationStatus.CONFIRMED, d, d);
                    long booked = already != null ? already : 0L;
                    available = booked < capacity;
                }
            } else if (pub instanceof Activity) {
                Activity a = (Activity) pub;
                int maxGroup = a.getMaxGroupSize();
                LocalDateTime startOfDay = d.atStartOfDay();
                LocalDateTime startOfNextDay = startOfDay.plusDays(1);
                Long already = reservationRepository.sumParticipantsForPublicationBetween(
                        publicationId, ReservationStatus.CONFIRMED, startOfDay, startOfNextDay);
                long booked = already != null ? already : 0L;
                available = booked < maxGroup;
            } else if (pub instanceof Restaurant) {
                Restaurant rest = (Restaurant) pub;
                String openingStartStr = rest.getOpeningStart();
                String openingEndStr = rest.getOpeningEnd();
                Integer capacity = rest.getCapacity();
                // Si no hay horarios, tratar como no disponible (o ajustar según política)
                if (openingStartStr == null || openingEndStr == null) {
                    available = false;
                } else {
                    try {
                        LocalTime openingStart = LocalTime.parse(openingStartStr);
                        LocalTime openingEnd = LocalTime.parse(openingEndStr);
                        available = false;
                        for (LocalTime t = openingStart; t.isBefore(openingEnd); t = t.plusHours(1)) {
                            LocalDateTime slotStart = d.atTime(t);
                            LocalDateTime slotEnd = slotStart.plusHours(1);
                            Long already = reservationRepository.sumGuestsForPublicationBetween(
                                    publicationId, ReservationStatus.CONFIRMED, slotStart, slotEnd);
                            long booked = already != null ? already : 0L;
                            if (capacity == null || booked < capacity) {
                                available = true;
                                break;
                            }
                        }
                    } catch (DateTimeParseException ex) {
                        available = false;
                    }
                }
            } else {
                // tipo no reconocido: por defecto disponible
                available = true;
            }

            result.add(new DailyAvailabilityDTO(d, available));
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Nuevo endpoint: obtiene franjas horarias de 1 hora para una fecha dada y si cada franja está disponible.
     * Ej: GET /publications/42/availability/hours?date=2025-11-12
     */
    @GetMapping("/{publicationId}/availability/hours")
    public ResponseEntity<List<HourlyAvailabilityDTO>> getHoursAvailability(
            @PathVariable Long publicationId,
            @RequestParam LocalDate date
    ) {
        Optional<Publication> maybe = publicationRepository.findById(publicationId);
        if (maybe.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Publication pub = maybe.get();
        if (!(pub instanceof Restaurant)) {
            return ResponseEntity.badRequest().build();
        }
        Restaurant rest = (Restaurant) pub;

        String openingStartStr = rest.getOpeningStart(); // se asume formato "HH:mm" o null
        String openingEndStr = rest.getOpeningEnd();
        if (openingStartStr == null || openingEndStr == null) {
            return ResponseEntity.badRequest().build();
        }

        LocalTime openingStart;
        LocalTime openingEnd;
        try {
            openingStart = LocalTime.parse(openingStartStr);
            openingEnd = LocalTime.parse(openingEndStr);
        } catch (DateTimeParseException ex) {
            return ResponseEntity.badRequest().build();
        }

        if (!openingStart.isBefore(openingEnd)) {
            return ResponseEntity.badRequest().build();
        }

        Integer capacity = rest.getCapacity(); // si es null => sin límite
        List<HourlyAvailabilityDTO> result = new ArrayList<>();

        for (LocalTime t = openingStart; t.isBefore(openingEnd); t = t.plusHours(1)) {
            LocalDateTime start = date.atTime(t);
            LocalDateTime end = start.plusHours(1);

            Long already = reservationRepository.sumGuestsForPublicationBetween(
                    publicationId,
                    ReservationStatus.CONFIRMED,
                    start,
                    end
            );
            long booked = already != null ? already : 0L;

            boolean available = capacity == null || booked < capacity;
            Integer availableSeats = capacity == null ? null : Math.max(0, capacity - (int) booked);

            result.add(new HourlyAvailabilityDTO(start, end, available, availableSeats));
        }

        return ResponseEntity.ok(result);
    }
}
