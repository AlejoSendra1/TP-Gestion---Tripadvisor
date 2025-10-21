package ar.uba.fi.gestion.trippy.field;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ar.uba.fi.gestion.trippy.FieldSchedule.FieldSchedule;
import ar.uba.fi.gestion.trippy.FieldSchedule.TimeSlot;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserZones;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class TestFieldSchedule {
    private Validator validator;

    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    public FieldSchedule buildValidSchedule() {
        return new FieldSchedule(
                List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY),
                LocalTime.of(8, 0),
                LocalTime.of(22, 0),
                60
        );
    }

    public User buildValidUser() {
        return new User(
                "Juan", "Pérez", "juan.perez@example.com", List.of(UserZones.AVELLANEDA), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
    }

    public Field buildValidField() {
        return new Field(
                buildValidUser(), "Cancha de Prueba",
                "Calle 123",
                UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS, FieldFeatures.WIFI, FieldFeatures.PARKING),
                List.of("https://example.com/image1.jpg", "https://example.com/image2.jpg")
        );
    }

    public List<Reservation> buildValidReservations(LocalDate date) {
        User user = buildValidUser();
        Field field = buildValidField();
        return List.of(
                new Reservation(field, date, LocalTime.of(10, 0), LocalTime.of(11, 0), user),
                new Reservation(field, date, LocalTime.of(12, 0), LocalTime.of(13, 0), user)
        );
    }

    @Test
    public void testValidFieldSchedulePassValidation() {
        FieldSchedule schedule = buildValidSchedule();
        var violations = validator.validate(schedule);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testNullStartTimeFailsValidation() {
        FieldSchedule schedule = new FieldSchedule(
                List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY),
                null,
                LocalTime.of(22, 0),
                60
        );

        var violations = validator.validate(schedule);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("startHour")));
    }

    @Test
    public void testNullEndTimeFailsValidation() {
        FieldSchedule schedule = new FieldSchedule(
                List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY),
                LocalTime.of(8, 0),
                null,
                60
        );

        var violations = validator.validate(schedule);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("endHour")));
    }

    @Test
    public void testNullDaysOfWeekFailsValidation() {
        FieldSchedule schedule = new FieldSchedule(
                null,
                LocalTime.of(8, 0),
                LocalTime.of(22, 0),
                60
        );

        var violations = validator.validate(schedule);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("days")));
    }

    @Test
    public void testNullDurationFailsValidation() {
        FieldSchedule schedule = new FieldSchedule(
                List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY),
                LocalTime.of(8, 0),
                LocalTime.of(22, 0),
                null
        );

        var violations = validator.validate(schedule);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("predefDuration")));
    }

    @Test
    public void testInvalidDurationFailsValidation() {
        FieldSchedule schedule = new FieldSchedule(
                List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY),
                LocalTime.of(8, 0),
                LocalTime.of(22, 0),
                -30
        );

        var violations = validator.validate(schedule);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("predefDuration")));
    }

    @Test
    public void testEmptyDaysOfWeekFailsValidation() {
        FieldSchedule schedule = new FieldSchedule(
                List.of(),
                LocalTime.of(8, 0),
                LocalTime.of(22, 0),
                60
        );

        var violations = validator.validate(schedule);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("days")));
    }

    @Test
    public void testGetTimeSlotsForClosedDate() {
        FieldSchedule schedule = buildValidSchedule(); // Solo abre lunes, miércoles y viernes
        List<TimeSlot> slots = schedule.getTimeSlotsForDate(LocalDate.of(2025, 6, 19), List.of()); // Un jueves

        assertTrue(slots.isEmpty());
    }

    @Test
    public void testGetTimeSlotsForOpenDateWithoutFullAvailability() {
        FieldSchedule schedule = buildValidSchedule(); // Abre lunes, miércoles y viernes de 8 a 22 con intervalos de 60 minutos -> intervalos totales: 14 por día
        List<TimeSlot> slots = schedule.getTimeSlotsForDate(LocalDate.of(2025, 6, 18), List.of()); // Un miércoles

        System.out.println(slots);
        assertTrue(slots.size() == 14);
    }

    @Test
    public void testGetTimeSlotsForOpenDateWithReservations() {
        FieldSchedule schedule = buildValidSchedule(); // Abre lunes, miércoles y viernes de 8 a 22 con intervalos de 60 minutos -> intervalos totales: 14 por día
        LocalDate date = LocalDate.of(2025, 7, 2); // Un miércoles
        List<Reservation> reservations = buildValidReservations(date); // 2 Reservas para el miércoles
        List<TimeSlot> slots = schedule.getTimeSlotsForDate(date, reservations);

        System.out.println(slots);
        assertTrue(slots.size() == 12); // Debería quedar 12 intervalos disponibles
    }

    @Test
    public void testGetTimeSlotsForOpenDateWithUnavailableTimeSlots() {
        FieldSchedule schedule = buildValidSchedule(); // Abre lunes, miércoles y viernes de 8 a 22 con intervalos de 60 minutos -> intervalos totales: 14 por día
        LocalDate date = LocalDate.of(2025, 7, 2); // Un miércoles

        List<TimeSlot> unavailableSlots = List.of(
                new TimeSlot(date, LocalTime.of(9, 0), LocalTime.of(10, 0)),
                new TimeSlot(date, LocalTime.of(11, 0), LocalTime.of(12, 0))
        );
        schedule.addUnavailableTimeSlot(unavailableSlots.get(0));
        schedule.addUnavailableTimeSlot(unavailableSlots.get(1));

        List<TimeSlot> slots = schedule.getTimeSlotsForDate(date, List.of());

        System.out.println(slots);
        assertTrue(slots.size() == 12); // Debería quedar 12 intervalos disponibles
    }

    @Test
    public void testGetWeeklyOccupiedTimeSlotsForDateWithoutReservations() {
        FieldSchedule schedule = buildValidSchedule();
        List<Reservation> reservations = List.of();

        int occupied_hours = schedule.getOccupiedHoursThisWeek(reservations);
        assertTrue(occupied_hours == 0); // No debería haber horas ocupadas
    }

    @Test
    public void testGetWeeklyOccupiedTimeSlotsForDateWithReservations() {
        FieldSchedule schedule = buildValidSchedule();
        LocalDate date = LocalDate.of(2025, 6, 20); // Un viernes
        List<Reservation> reservations = buildValidReservations(date); // 2 Reservas para el viernes

        int occupied_hours = schedule.getOccupiedHoursThisWeek(reservations);
        assertTrue(occupied_hours == 2); // Debería haber 2 horas ocupadas
    }

    @Test
    public void testGetMonthlyOccupiedTimeSlotsForDateWithoutReservations() {
        FieldSchedule schedule = buildValidSchedule();
        List<Reservation> reservations = List.of();

        int occupied_hours = schedule.getOccupiedHoursThisMonth(reservations);
        assertTrue(occupied_hours == 0); // No debería haber horas ocupadas
    }

    @Test
    public void testGetMonthlyOccupiedTimeSlotsForDateWithReservations() {
        FieldSchedule schedule = buildValidSchedule();
        LocalDate date = LocalDate.of(2025, 6, 25); // Un miércoles
        List<Reservation> reservations = new ArrayList<>(buildValidReservations(date));  // 2 Reservas para una semana
        LocalDate anotherDate = LocalDate.of(2025, 6, 30); // Un viernes
        reservations.addAll(buildValidReservations(anotherDate)); // Agregamos 2 reservas otra semana
        int occupied_hours = schedule.getOccupiedHoursThisMonth(reservations);
        assertTrue(occupied_hours == 4); // Debería haber 4 horas ocupadas
    }
}
