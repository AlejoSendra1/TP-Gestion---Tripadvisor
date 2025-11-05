// java
package ar.uba.fi.gestion.trippy.reservation.dto;

import ar.uba.fi.gestion.trippy.reservation.Reservation;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReservationResponseDTO(
        Long id,
        Long publicationId,
        Long travelerId,
        LocalDateTime reservationDate,
        LocalDateTime startDate,
        LocalDateTime endDate,
        BigDecimal totalPrice,
        String status,
        Integer guestCount,
        String notes
) {
    public static ReservationResponseDTO from(Reservation r) {
        return new ReservationResponseDTO(
                r.getId(),
                r.getPublication() != null ? r.getPublication().getId() : null,
                r.getTraveler() != null ? r.getTraveler().getId() : null,
                r.getReservationDate(),
                r.getStartDate(),
                r.getEndDate(),
                r.getTotalPrice(),
                r.getStatus() != null ? r.getStatus().name() : null,
                r.getGuestCount(),
                r.getNotes()
        );
    }
}
