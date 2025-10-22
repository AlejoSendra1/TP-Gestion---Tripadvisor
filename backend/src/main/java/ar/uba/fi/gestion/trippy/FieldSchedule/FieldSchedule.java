package ar.uba.fi.gestion.trippy.FieldSchedule;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import ar.uba.fi.gestion.trippy.reservation.Reservation;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
public class FieldSchedule implements Serializable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La cancha debe tener un horario asignado")
    @NotEmpty(message = "La cancha debe tener al menos un día de la semana")
    @ElementCollection
    @CollectionTable(name = "schedule_days", joinColumns = @JoinColumn(name = "schedule_id"))
    @Column(name = "day", nullable = false)
    @Enumerated(EnumType.STRING)
    private List<DayOfWeek> days;

    @Column(name = "start_hour", nullable = false)
    @NotNull(message = "La hora de inicio no puede ser nula")
    private LocalTime startHour;

    @Column(name = "end_hour", nullable = false)
    @NotNull(message = "La hora de fin no puede ser nula")
    private LocalTime endHour;

    @Column(name = "predef_duration", nullable = false)
    @NotNull(message = "La duración predefinida no puede ser nula")
    @Positive(message = "La duración predefinida debe ser un valor positivo")
    private Integer predefDuration;

    @ElementCollection
    @CollectionTable(name = "schedule_unavailable_timeslots", joinColumns = @JoinColumn(name = "schedule_id"))
    @Column(name = "unavailable_timeslots", nullable = false)
    List<TimeSlot> unavailableTimeSlots;

    public FieldSchedule() {
        this.days = new ArrayList<>();
        this.days.add(DayOfWeek.FRIDAY); // seteo un default para que no sea null
        this.startHour = LocalTime.of(8, 0); // seteo un default para que no sea null
        this.endHour = LocalTime.of(22, 0); 
        this.predefDuration =  60; // tiempo en minutos
        this.unavailableTimeSlots = new ArrayList<>();
    }

    public FieldSchedule(List<DayOfWeek> days, LocalTime startHour, LocalTime endHour, Integer predefDuration) {
        this.days = days;
        this.startHour = startHour;
        this.endHour = endHour;
        this.predefDuration = predefDuration;
        this.unavailableTimeSlots = new ArrayList<>();
    }

    public List<DayOfWeek> getDays() {
        return days;
    }

    public LocalTime getStartHour() {
        return startHour;
    }

    public LocalTime getEndHour() {
        return endHour;
    }

    public int getPredefDuration() {
        return predefDuration;
    }

    public List<TimeSlot> getUnavailableTimeSlots() {
        return unavailableTimeSlots;
    }

    public void addUnavailableTimeSlot(TimeSlot timeSlot) {
        this.unavailableTimeSlots.add(timeSlot);
    }

    public List<TimeSlot> getTimeSlotsForDate(LocalDate date, List<Reservation> reservations) {
        DayOfWeek day = date.getDayOfWeek();
        if (!days.contains(day)) {
            return new ArrayList<>();
        }

        List<TimeSlot> timeSlots = new ArrayList<>();
        LocalTime actualTimeSlotStart = this.startHour;
        
        while (actualTimeSlotStart.isBefore(this.endHour)) {
            LocalTime nextTimeSlotStart = actualTimeSlotStart.plusMinutes(this.predefDuration);
            
            if (!nextTimeSlotStart.isAfter(this.endHour)) {
                timeSlots.add(new TimeSlot(date, actualTimeSlotStart, nextTimeSlotStart));
            }

            actualTimeSlotStart = nextTimeSlotStart;
        }

        System.out.println("Reserved time slots for " + date + ": " + reservations.stream().map(res -> res.getStart() + " - " + res.getEnd()).toList());

        timeSlots.removeIf(slot -> reservations.stream()
            .anyMatch(reservation -> 
                slot.getStartHour().isBefore(reservation.getEnd()) &&
                slot.getEndHour().isAfter(reservation.getStart())
            )
        );

        timeSlots.removeIf(slot -> 
            unavailableTimeSlots.stream()
                .anyMatch(unavailable -> 
                    slot.getDate().equals(unavailable.getDate()) &&
                    slot.getStartHour().isBefore(unavailable.getEndHour()) &&
                    slot.getEndHour().isAfter(unavailable.getStartHour())
                )
        );

        return timeSlots;
    }

    public Long getId() {
        return id;
    }

    public void setDays(List<DayOfWeek> days) {
        this.days = days;
    }

    public void setStartHour(String startHour) {
        String[] startHourParts = startHour.split(":");
        this.startHour = LocalTime.of(Integer.parseInt(startHourParts[0]), Integer.parseInt(startHourParts[1]));
    }
    
    public void setEndHour(String endHour) {
        String[] endHourParts = endHour.split(":");
        this.endHour = LocalTime.of(Integer.parseInt(endHourParts[0]), Integer.parseInt(endHourParts[1]));
    }

    public void setStartHour(LocalTime startHour) {
        this.startHour = startHour;
    }
    
    public void setEndHour(LocalTime endHour) {
        this.endHour = endHour;
    }

    public void setPredefDuration(Integer predefDuration) {
        this.predefDuration = predefDuration;
    }

    public int getTotalHours() {
        int open_hours = this.endHour.getHour() - this.startHour.getHour();
        int open_days = this.days.size();
        int total_hours = open_hours * open_days;
        return total_hours;
    }

    public int getOccupiedHoursThisWeek(List<Reservation> reservations) {
        if (reservations == null || reservations.isEmpty()) {
            return 0;
        }

        int occupied_hours = 0;
        for (Reservation reservation : reservations) {
            if (reservation.getDate().isBefore(LocalDate.now()) ||
                reservation.getDate().isAfter(LocalDate.now().plusDays(7))) {
                continue;
            }
            occupied_hours += reservation.getEnd().getHour() - reservation.getStart().getHour();
        }
        return occupied_hours;
    }

    public int getOccupiedHoursThisMonth(List<Reservation> reservations) {
        if (reservations == null || reservations.isEmpty()) {
            return 0;
        }

        int occupied_hours = 0;
        for (Reservation reservation : reservations) {
            if (reservation.getDate().getMonth() != LocalDate.now().getMonth() ||
                reservation.getDate().getYear() != LocalDate.now().getYear()) {
                continue;
            }
            occupied_hours += reservation.getEnd().getHour() - reservation.getStart().getHour();
        }
        return occupied_hours;
    }
}
