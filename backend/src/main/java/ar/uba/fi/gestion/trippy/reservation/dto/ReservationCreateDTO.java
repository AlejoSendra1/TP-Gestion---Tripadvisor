// java
package ar.uba.fi.gestion.trippy.reservation.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationCreateDTO(
        @JsonAlias({"startDate", "start_date"}) LocalDate startDate,
        @JsonAlias({"endDate", "end_date"}) LocalDate endDate,
        @JsonAlias({"dateTime", "date_time"}) LocalDateTime dateTime,               // para RESTAURANT, ACTIVITY (hora solicitada)
        @JsonAlias({"reservationDate", "reservation_date"}) LocalDateTime reservationDate, // fecha de creación opcional
        @JsonAlias({"guests", "guestCount", "guest_count"}) Integer guests,
        @JsonAlias({"roomCount", "rooms", "room_count"}) Integer roomCount,
        @JsonAlias({"additionalInfo", "notes"}) String additionalInfo
) {}