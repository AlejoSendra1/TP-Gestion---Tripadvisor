package ar.uba.fi.ingsoft1.todo_template.reservation;

import ar.uba.fi.ingsoft1.todo_template.user.UserZones;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalTime;
@Schema(description = "Confirmacion de reserva de una cancha", example = """
        {"id": 1,
        "fieldId": 3,
        "organizer": pepe03@gmail.com,
        "date": "2025-06-17",
        "start": "18:30",
        "end": "19:30"
        }"""
)

public record ReservationDTO(
    Long id,
    Long fieldId,
    String fieldName,
    UserZones fieldZone,
    String organizerEmail,
    LocalDate date,
    LocalTime start,
    LocalTime end
) {
    public ReservationDTO(Reservation reservation) {
        this(
            reservation.getId(),
            reservation.getField().getId(),
            reservation.getField().getName(),
            reservation.getField().getZone(),
            reservation.getOrganizer().getEmail(),
            reservation.getDate(),
            reservation.getStart(),
            reservation.getEnd()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getFieldId() {
        return fieldId;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getStart() {
        return start;
    }

    public LocalTime getEnd() {
        return end;
    }
}
