// java
package ar.uba.fi.gestion.trippy.reservation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationRequestDTO {
    private LocalDate startDate;    // para HOTEL, COWORKING
    private LocalDate endDate;      // opcional según tipo
    private LocalDateTime dateTime; // para RESTAURANT, ACTIVITY
    private Integer guestCount;     // para RESTAURANT, COWORKING
    private Integer roomCount;      // para HOTEL
    private LocalDateTime reservationDate; // fecha de creación solicitada (opcional)

    public ReservationRequestDTO() {}

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }
    public Integer getRoomCount() { return roomCount; }
    public void setRoomCount(Integer roomCount) { this.roomCount = roomCount; }
    public LocalDateTime getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDateTime reservationDate) { this.reservationDate = reservationDate; }
}
