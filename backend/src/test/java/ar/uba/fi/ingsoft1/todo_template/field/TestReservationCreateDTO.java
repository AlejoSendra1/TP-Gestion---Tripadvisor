package ar.uba.fi.ingsoft1.todo_template.field;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ar.uba.fi.ingsoft1.todo_template.reservation.ReservationCreateDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class TestReservationCreateDTO {
    private Validator validator;

    private ReservationCreateDTO buildValidDTO() {
        return new ReservationCreateDTO(
                1L,
                LocalDate.now(),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0)
        );
    }

    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    public void testValidReservationCreateDTO() {
        ReservationCreateDTO dto = buildValidDTO();
        Set<ConstraintViolation<ReservationCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testNullFieldIdFailsValidation() {
        ReservationCreateDTO dto = new ReservationCreateDTO(
                null,
                LocalDate.now(),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0)
        );

        Set<ConstraintViolation<ReservationCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("fieldId")));
    }

    @Test
    public void testNullDateFailsValidation() {
        ReservationCreateDTO dto = new ReservationCreateDTO(
                1L,
                null,
                LocalTime.of(10, 0),
                LocalTime.of(11, 0)
        );

        Set<ConstraintViolation<ReservationCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("date")));
    }

    @Test
    public void testNullStartTimeFailsValidation() {
        ReservationCreateDTO dto = new ReservationCreateDTO(
                1L,
                LocalDate.now(),
                null,
                LocalTime.of(11, 0)
        );

        Set<ConstraintViolation<ReservationCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("start")));
    }

    @Test
    public void testNullEndTimeFailsValidation() {
        ReservationCreateDTO dto = new ReservationCreateDTO(
                1L,
                LocalDate.now(),
                LocalTime.of(10, 0),
                null
        );

        Set<ConstraintViolation<ReservationCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("end")));
    }

}
