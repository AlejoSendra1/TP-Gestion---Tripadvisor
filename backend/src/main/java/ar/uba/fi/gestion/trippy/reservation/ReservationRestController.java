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
import java.util.stream.Collectors;

import java.util.List;


@RestController
@RequestMapping("/publications/{publicationId}/reservations")
public class ReservationRestController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationRestController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations(
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        var reservations = reservationService.getReservationsForTraveler(me.username());
        var dtoList = reservations.stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
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

    // Listar todas las reservas de la publicación (solo host)
    @GetMapping("/all")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsForPublication(
            @PathVariable Long publicationId,
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        var reservations = reservationService.getReservationsForPublication(publicationId, me.username());
        var dtoList = reservations.stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<ReservationResponseDTO> cancelReservation(
            @PathVariable Long publicationId,
            @PathVariable Long reservationId,
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        Reservation cancelled = reservationService.cancelReservation(publicationId, reservationId, me.username());
        return ResponseEntity.ok(ReservationResponseDTO.from(cancelled));
    }

    
}
