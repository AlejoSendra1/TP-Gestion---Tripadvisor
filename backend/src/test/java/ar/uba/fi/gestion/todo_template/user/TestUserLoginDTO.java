package ar.uba.fi.gestion.todo_template.user;

import jakarta.validation.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class TestUserLoginDTO {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private UserLoginDTO buildValidDTO() {
        return new UserLoginDTO("juan@ejemplo.com", "ejemplo123");
    }

    @Test
    void validDTO_passesValidation() {
        UserLoginDTO dto = buildValidDTO();
        Set<ConstraintViolation<UserLoginDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty(), "Expected no constraint violations");
    }

    @Test
    void blankEmail_failsValidation() {
        UserLoginDTO dto = new UserLoginDTO("   ", "ejemplo123");
        Set<ConstraintViolation<UserLoginDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void blankPassword_failsValidation() {
        UserLoginDTO dto = new UserLoginDTO("juan@ejemplo.com", "");
        Set<ConstraintViolation<UserLoginDTO>> violations = validator.validate(dto);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    void tooLongEmail_failsValidation() {
        String longEmail = "a".repeat(256) + "@test.com";
        UserLoginDTO dto = new UserLoginDTO(longEmail, "password");

        Set<ConstraintViolation<UserLoginDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void tooLongPassword_failsValidation() {
        String longPassword = "a".repeat(256);
        UserLoginDTO dto = new UserLoginDTO("juan@ejemplo.com", longPassword);

        Set<ConstraintViolation<UserLoginDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }
}
