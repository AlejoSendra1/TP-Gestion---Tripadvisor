package ar.uba.fi.gestion.trippy.FieldSchedule;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Embeddable;

@Embeddable
public class TimeSlot implements Serializable{
    private LocalDate date;
    private LocalTime startHour;
    private LocalTime endHour;

    public TimeSlot() {}

    public TimeSlot(LocalDate date, LocalTime startHour, LocalTime endHour) {
        this.date = date;
        this.startHour = startHour;
        this.endHour = endHour;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getStartHour() {
        return startHour;
    }

    public LocalTime getEndHour() {
        return endHour;
    }

    @Override
    public String toString() {
        return date + " " + startHour + " - " + endHour;
    }
}
