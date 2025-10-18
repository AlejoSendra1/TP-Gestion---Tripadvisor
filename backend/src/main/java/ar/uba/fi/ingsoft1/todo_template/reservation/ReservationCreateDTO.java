package ar.uba.fi.ingsoft1.todo_template.reservation;

import java.time.LocalDate;
import java.time.LocalTime;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
@Schema(description = "Creacion de reservas", example = """
                {
                "fieldId": 3,
                "date": "2025-06-17",
                "start": "18:30",
                "end": "19:30"
                }
        """
)
public record ReservationCreateDTO(
    @NotNull @Positive Long fieldId,
    @NotNull LocalDate date,
    @NotNull LocalTime start,
    @NotNull LocalTime end
) {
    public Reservation asReservation(Field field, User organizer) {
        return new Reservation(
            field, 
            date,
            start,
            end,
            organizer
        );
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