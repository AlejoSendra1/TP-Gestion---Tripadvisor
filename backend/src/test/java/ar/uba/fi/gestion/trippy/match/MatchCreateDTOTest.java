package ar.uba.fi.gestion.trippy.match;

import ar.uba.fi.gestion.trippy.match.participationType.OpenDTO;
import ar.uba.fi.gestion.trippy.reservation.ReservationCreateDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class MatchCreateDTOTest {
    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void validDTO_passesValidation() {
        MatchCreateDTO dto = new MatchCreateDTO(
                new OpenDTO(2,8,new HashSet<>()),
                new ReservationCreateDTO(
                        1L,
                        LocalDate.now(),
                        LocalTime.of(10, 0),
                        LocalTime.of(11, 0)
                )
        );
        Set<ConstraintViolation<MatchCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }



    @Test
    void testNullParticipationFailsValidation() {
        MatchCreateDTO dto = new MatchCreateDTO(
            new OpenDTO(2,8,new HashSet<>()),
            null
        );


        Set<ConstraintViolation<MatchCreateDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("reservation")));
    }

    @Test
    void testNullReservationFailsValidation() {
        MatchCreateDTO dto = new MatchCreateDTO(
                null,
                new ReservationCreateDTO(
                        1L,
                        LocalDate.now(),
                        LocalTime.of(10, 0),
                        LocalTime.of(11, 0)
                )
        );

        Set<ConstraintViolation<MatchCreateDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("participationType")));
    }

}
