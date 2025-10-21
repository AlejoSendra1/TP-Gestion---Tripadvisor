package ar.uba.fi.gestion.trippy.FieldSchedule;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public record FieldScheduleDTO(

    @Schema(description = "ID de los horarios")
    Long id,
    @Schema(description = "Días de la semana disponibles", example = "[\"MONDAY\", \"WEDNESDAY\", \"FRIDAY\"]")
    List<String> days,
    @Schema(description = "Hora de inicio", example = "08:30")
    LocalTime startHour,
    @Schema(description = "Hora de fin", example = "22:00")
    LocalTime endHour,
    @Schema(description = "Duración predeterminada de cada turno (en minutos)", example = "60")
    Integer predefDuration,

    @Schema(description = "\"Horarios no disponibles de la cancha", example= "[\"MONDAY 10:00-11:00\", \"WEDNESDAY 14:00-15:00\"]")
    List<String> unavailableFieldSchedules
    ){

    public FieldScheduleDTO(FieldSchedule fieldSchedule) {
        this(
                fieldSchedule.getId(), 
                fieldSchedule.getDays().stream().map(DayOfWeek::toString).toList(),
                fieldSchedule.getStartHour(), 
                fieldSchedule.getEndHour(),
                fieldSchedule.getPredefDuration(),
                fieldSchedule.getUnavailableTimeSlots().stream().map(timeSlot -> timeSlot.toString()).toList()
            );
    }
}
