// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/publications/{publicationId}/reservations")
public class ReservationRestController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationRestController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> createReservation(
            @PathVariable Long publicationId,
            @RequestBody ReservationCreateDTO dto,
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        Reservation saved = reservationService.createReservation(publicationId, dto, me.username());
        return ResponseEntity.status(HttpStatus.CREATED).body(ReservationResponseDTO.from(saved));
    }
}
