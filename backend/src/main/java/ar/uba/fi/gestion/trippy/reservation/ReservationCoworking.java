// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Entity
@DiscriminatorValue("COWORKING")
public class ReservationCoworking extends Reservation {

    @Column(name = "start_date")
    private LocalDate starDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "guest_count")
    private Integer guestCount;

    protected ReservationCoworking() { super(); }

    public ReservationCoworking(Publication pub, User traveler, ReservationCreateDTO dto) {
        super(pub, traveler, dto);

        if (dto != null && dto.startDate() != null) {
            this.starDate = dto.startDate();
            this.endDate = dto.endDate() != null ? dto.endDate() : this.starDate;
        }

        this.guestCount = Optional.ofNullable(dto).map(ReservationCreateDTO::guests).orElse(1);

        BigDecimal unitPrice = BigDecimal.valueOf(pub.getPrice());
        long days = 1;
        if (this.starDate != null && this.endDate != null) {
            days += ChronoUnit.DAYS.between(this.starDate, this.endDate);
            if (days <= 0) days = 1;
        }
        this.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(days)).multiply(BigDecimal.valueOf(this.guestCount)));
    }

    @Override
    public void validateCapacity(ReservationRepository reservationRepository) {
        // No-op para coworking (o implementar validación específica si se requiere)
    }

    public LocalDate getstarDate() { return starDate; }
    public void setstarDate(LocalDate starDate) { this.starDate = starDate; }
    public LocalDate getendDate() { return endDate; }
    public void setendDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }
}
