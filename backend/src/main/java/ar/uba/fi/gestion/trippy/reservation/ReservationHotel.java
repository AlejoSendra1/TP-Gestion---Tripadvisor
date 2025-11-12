// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Hotel;
import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Entity
@DiscriminatorValue("HOTEL")
public class ReservationHotel extends Reservation {

    @Column(name = "check_in")
    private LocalDate checkIn;

    @Column(name = "check_out")
    private LocalDate checkOut;

    @Column(name = "room_count")
    private Integer roomCount;

    protected ReservationHotel() { super(); }

    public ReservationHotel(Publication pub, User traveler, ReservationCreateDTO dto) {
        super(pub, traveler, dto);

        if (dto != null && dto.startDate() != null) {
            this.checkIn = dto.startDate();
            this.checkOut = dto.endDate() != null ? dto.endDate() : this.checkIn;
        }

        this.roomCount = Optional.ofNullable(dto)
                .map(ReservationCreateDTO::roomCount)
                .orElse(1);

        BigDecimal unitPrice = BigDecimal.valueOf(pub.getPrice());
        long days = 1;
        if (this.checkIn != null && this.checkOut != null) {
            days += ChronoUnit.DAYS.between(this.checkIn, this.checkOut);
            if (days <= 0) days = 1;
        }
        this.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(days)).multiply(BigDecimal.valueOf(this.roomCount)));
    }

    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public Integer getRoomCount() { return roomCount; }
    public void setRoomCount(Integer roomCount) { this.roomCount = roomCount; }

    /* Valida que en las fechas solicitadas haya habitaciones disponibles*/
    @Override
    public void validateCapacity(ReservationRepository reservationRepository) {
        Hotel hotel = (Hotel) getPublication();
        if (this.checkIn == null) {
            throw new IllegalStateException("Las reservas de hotel requieren una fecha de inicio.");
        }
        LocalDate start = this.checkIn;
        LocalDate end = this.checkOut != null ? this.checkOut : start;

        int requestedRooms = this.roomCount != null ? this.roomCount : 1;

        Long alreadyBooked = reservationRepository.sumBookedRoomsForPublicationBetween(
                getPublication().getId(), ReservationStatus.CONFIRMED, start, end);

        long booked = alreadyBooked != null ? alreadyBooked : 0L;
        int maxRooms = hotel.getRoomCount();

        if (booked + requestedRooms > maxRooms) {
            throw new IllegalStateException("No hay suficientes habitaciones disponibles en las fechas seleccionadas.");
        }
    }
}
