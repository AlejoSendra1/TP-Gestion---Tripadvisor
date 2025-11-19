// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationResponseDTO;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reservations")
public class ReservationUserController {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    @Autowired
    public ReservationUserController(ReservationRepository reservationRepository,
                                     UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations(
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        System.out.println("Fetching reservations for user: " + (me != null ? me.username() : "null"));
        if (me == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(me.username()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Reservation> reservations = reservationRepository.findByTravelerId(user.getId());
        List<ReservationResponseDTO> dto = reservations.stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }
}
