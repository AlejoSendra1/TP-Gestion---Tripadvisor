package ar.uba.fi.gestion.trippy.FieldSchedule;

import java.time.LocalDate;
import java.time.LocalTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Franja Horaria")
public record TimeSlotDTO(
    @Schema(description ="Dias disponibles" )
    @NotNull String date,
    @Schema(description = "Hora de inicio", example = "08:30")
    @NotNull String startHour,
    @Schema(description = "Hora de fin", example = "22:30")
    @NotNull String endHour
) {
    public TimeSlot asTimeSlot() {
        return new TimeSlot(
            LocalDate.parse(date),
            LocalTime.parse(startHour),
            LocalTime.parse(endHour)
        );
    }
}
