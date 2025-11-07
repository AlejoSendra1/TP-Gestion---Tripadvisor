package ar.uba.fi.gestion.trippy.reservation.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationCreateDTO(
        @JsonAlias({"startDate", "start_date"}) LocalDate startDate,
        @JsonAlias({"endDate", "end_date"}) LocalDate endDate,
        @JsonAlias({"dateTime", "reservationDate", "reservation_date"}) LocalDateTime dateTime,
        @JsonAlias({"guests", "guestCount", "guest_count"}) Integer guests,
        @JsonAlias({"roomCount", "rooms", "room_count"}) Integer roomCount,
        @JsonAlias({"additionalInfo", "notes"}) String additionalInfo
) {}