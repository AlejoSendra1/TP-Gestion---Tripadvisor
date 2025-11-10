// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Entity
@DiscriminatorValue("RESTAURANT")
public class ReservationRestaurant extends Reservation {

    @Column(name = "reservation_datetime")
    private LocalDateTime dateTime;

    @Column(name = "cover_count")
    private Integer guestCount;

    protected ReservationRestaurant() { super(); }

    public ReservationRestaurant(Publication pub, User traveler, ReservationCreateDTO dto) {
        super(pub, traveler, dto);

        if (dto != null && dto.dateTime() != null) {
            this.dateTime = dto.dateTime();
        }

        this.guestCount = Optional.ofNullable(dto).map(ReservationCreateDTO::guests).orElse(1);

        BigDecimal unitPrice = BigDecimal.valueOf(pub.getPrice());
        this.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(this.guestCount)));
    }

    @Override
    public void validateCapacity(ReservationRepository reservationRepository) {
        if (this.dateTime == null) {
            throw new IllegalStateException("Las reservas de restaurant requieren fecha y hora de inicio.");
        }
        // exigir hora en punto (ej. 18:00), sin minutos/segundos/nanos
        if (dateTime.getMinute() != 0 || dateTime.getSecond() != 0 || dateTime.getNano() != 0) {
            throw new IllegalStateException("La hora de la reserva debe ser una hora en punto (por ejemplo: 18:00).");
        }

        // Validación de capacidad por hora puede agregarse aquí si la entidad Restaurant expone capacidad.
        // Ejemplo (opcional): sumar cubiertos ya reservados entre dateTime y dateTime.plusHours(1)
    }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }
}
