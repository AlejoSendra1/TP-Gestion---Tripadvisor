// language: java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationResponseDTO;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import ar.uba.fi.gestion.trippy.reservation.ReservationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reservations")
public class ReservationUserController {

    private final UserRepository userRepository;
    private final ReservationService reservationService;

    @Autowired
    public ReservationUserController(ReservationService reservationService,
                                     UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    /**
     * Endpoint existente para que el usuario vea "Mis Reservas"
     * Ahora delega toda la lógica al servicio.
     */
    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations(
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        if (me == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(me.username()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Reservation> reservations = reservationService.getReservationsForTraveler(me.username());
        List<ReservationResponseDTO> dto = reservations.stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }


    /**
     * Endpoint para obtener detalles de una reserva (usado por CheckoutPage.tsx).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> getReservationById(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUserDetails authenticatedUser
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ReservationResponseDTO reservation = reservationService.getReservationById(
                id,
                authenticatedUser.username()
        );
        return ResponseEntity.ok(reservation);
    }

    // --- MANEJADORES DE ERROR ---
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }
}