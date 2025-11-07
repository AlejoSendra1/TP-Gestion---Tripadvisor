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
@DiscriminatorValue("ACTIVITY")
public class ReservationActivity extends Reservation {

    @Column(name = "start_datetime")
    private LocalDateTime startDateTime;

    @Column(name = "participant_count")
    private Integer participantCount;

    protected ReservationActivity() { super(); }

    public ReservationActivity(Publication pub, User traveler, ReservationCreateDTO dto) {
        super(pub, traveler, dto);

        if (dto != null && dto.dateTime() != null) {
            this.startDateTime = dto.dateTime();
        }

        this.participantCount = Optional.ofNullable(dto).map(ReservationCreateDTO::guests).orElse(1);

        BigDecimal unitPrice = BigDecimal.valueOf(pub.getPrice());
        this.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(this.participantCount)));
    }

    @Override
    public void validateCapacity(ReservationRepository reservationRepository) {
        // No-op para activity (o implementar validación específica si se requiere)
    }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }
    public Integer getParticipantCount() { return participantCount; }
    public void setParticipantCount(Integer participantCount) { this.participantCount = participantCount; }
}
