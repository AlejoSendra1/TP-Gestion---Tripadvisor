package ar.uba.fi.ingsoft1.todo_template.FieldSchedule;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
public record FieldScheduleCreateDTO(
    @Schema(description = "Dias disponibles",example = "[\"MONDAY\", \" TUESDAY\", \"WEDNESDAY\", \"THURSDAY\",\"FRIDAY\", \"SATURDAY\",\"SUNDAY\"]")
    List<DayOfWeek> days,
    @Schema(description = "Hora de inicio", example = "08:30")
    LocalTime startHour,
    @Schema(description = "Hora de fin", example = "22:30")
    LocalTime endHour,
    @Schema(description = "Duración predeterminada de cada turno (en minutos)", example = "60")
    Integer predefDuration
) {
    public List<DayOfWeek> getDays() {
        return days;
    }

    public LocalTime getStartHour() {
        return startHour;
    }

    public LocalTime getEndHour() {
        return endHour;
    }

    public Integer getPredefDuration() {
        return predefDuration;
    }
}