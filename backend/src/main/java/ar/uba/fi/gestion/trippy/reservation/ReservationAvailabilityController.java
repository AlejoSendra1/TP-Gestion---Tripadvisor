// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.reservation.dto.DailyAvailabilityDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

        LocalDate start = LocalDate.now().plusDays(5); // desde 5 dias dps

        List<DailyAvailabilityDTO> result = new ArrayList<>(35);
        for (int i = 0; i < 30; i++) {
            LocalDate d = start.plusDays(i);
            // sin verificar superposición: todos disponibles = true
            result.add(new DailyAvailabilityDTO(d, true));
        }

        return ResponseEntity.ok(result);
    }
}
