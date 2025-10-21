package ar.uba.fi.gestion.todo_template.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.*;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
/*
public class TestUserCreateDTO {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private UserCreateDTO buildValidDTO() {
        return new UserCreateDTO(
                "Juan",
                "Pérez",
                "juan@ejemplo.com",
                "contrasenaSegura123",
                "http://example.com/photo.jpg",
                "hombre",
                (short) 25
        );
    }

    @Test
    void validDTO_passesValidation() {
        UserCreateDTO dto = buildValidDTO();
        Set<ConstraintViolation<UserCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void blankName_failsValidation() {
        UserCreateDTO dto = new UserCreateDTO(
                "", "Pérez", "juan@ejemplo.com",
                "contra", null,
                "hombre", (short) 25
        );

        Set<ConstraintViolation<UserCreateDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    void invalidEmail_failsValidation() {
        UserCreateDTO dto = buildValidDTO();
        dto = new UserCreateDTO(
                dto.name(), dto.lastname(), "email-invalido",
                dto.password(), dto.photo(),
                dto.gender(), dto.age()
        );

        Set<ConstraintViolation<UserCreateDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void ageBelowMinimum_failsValidation() {
        UserCreateDTO dto = new UserCreateDTO(
                "Juan", "Pérez", "juan@ejemplo.com",
                "contra", null,
                "hombre", (short) 10
        );

        Set<ConstraintViolation<UserCreateDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("age")));
    }

    @Test
    void ageAboveMaximum_failsValidation() {
        UserCreateDTO dto = new UserCreateDTO(
                "Juan", "Pérez", "juan@ejemplo.com",
                "contra", null,
                "hombre", (short) 151
        );

        Set<ConstraintViolation<UserCreateDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("age")));
    }

    @Test
    void asUser_appliesPasswordEncryption() {
        UserCreateDTO dto = buildValidDTO();
        Function<String, String> encryptor = pwd -> "encriptada_" + pwd;

        User user = dto.asUser(encryptor);

        assertEquals("Juan", user.getName());
        assertEquals("Pérez", user.getLastname());
        assertEquals("juan@ejemplo.com", user.getEmail());
        assertEquals("encriptada_contrasenaSegura123", user.getPassword());
        assertEquals("http://example.com/photo.jpg", user.getPhoto());
        assertEquals("hombre", user.getGender());
        assertEquals((Short) (short) 25, user.getAge());
    }
}
*/

