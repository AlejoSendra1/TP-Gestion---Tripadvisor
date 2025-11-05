// language: java
package ar.uba.fi.gestion.trippy.reservation.dto;

import java.time.LocalDateTime;

public class ReservationRequestDTO {
    private LocalDateTime startDate;    // para HOTEL, COWORKING, ACTIVITY
    private LocalDateTime endDate;      // opcional según tipo
    private Integer guestCount;         // para HOTEL, RESTAURANT
    private LocalDateTime reservationDate; // fecha de creación solicitada (opcional)

    // getters / setters
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public Integer getGuestCount() { return guestCount; }
    public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }
    public LocalDateTime getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDateTime reservationDate) { this.reservationDate = reservationDate; }
}
