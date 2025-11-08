// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Activity;
import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
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
        Activity a = (Activity) getPublication();
        if (this.startDateTime == null) {
            throw new IllegalStateException("Las reservas de activity requieren fecha/hora de inicio.");
        }
        int requested = this.participantCount != null ? this.participantCount : 1;

        LocalDate day = this.startDateTime.toLocalDate();
        LocalDateTime startOfDay = day.atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);

        Long already = reservationRepository.sumParticipantsForPublicationBetween(
                getPublication().getId(), ReservationStatus.CONFIRMED, startOfDay, startOfNextDay);

        long booked = already != null ? already : 0L;

        int maxGroup = a.getMaxGroupSize();

        if (booked + requested > maxGroup) {
            throw new IllegalStateException("No hay cupo disponible en la actividad para la fecha seleccionada.");
        }
    }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }
    public Integer getParticipantCount() { return participantCount; }
    public void setParticipantCount(Integer participantCount) { this.participantCount = participantCount; }
}
