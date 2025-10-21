package ar.uba.fi.gestion.trippy.field;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ar.uba.fi.gestion.trippy.user.UserZones;

public class TestFieldCreateDTO {

    private Validator validator;

    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private FieldCreateDTO buildValidDTO() {
        return new FieldCreateDTO(
                "Cancha de Prueba",
                "Calle 123",
                UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS, FieldFeatures.WIFI, FieldFeatures.PARKING),
                List.of("https://example.com/image1.jpg", "https://example.com/image2.jpg")
        );
    }

    @Test
    public void testValidFieldCreateDTO() {
        FieldCreateDTO dto = buildValidDTO();
        Set<ConstraintViolation<FieldCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testBlankNameFailsValidation() {
        FieldCreateDTO dto = new FieldCreateDTO(
                "", "Calle 123", UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS), List.of("https://example.com/image1.jpg")
        );

        Set<ConstraintViolation<FieldCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    public void testNullZoneFailsValidation() {
        FieldCreateDTO dto = new FieldCreateDTO(
                "Cancha de Prueba", "Calle 123", null,
                List.of(FieldFeatures.GRASS), List.of("https://example.com/image1.jpg")
        );

        Set<ConstraintViolation<FieldCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("zone")));
    }

    @Test
    public void testEmptyFeaturesFailsValidation() {
        FieldCreateDTO dto = new FieldCreateDTO(
                "Cancha de Prueba", "Calle 123", UserZones.AVELLANEDA,
                List.of(), List.of("https://example.com/image1.jpg")
        );

        Set<ConstraintViolation<FieldCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("features")));
    }

    @Test
    public void testNullImagesPassValidation() {
        FieldCreateDTO dto = new FieldCreateDTO(
                "Cancha de Prueba", "Calle 123", UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS), null
        );

        Set<ConstraintViolation<FieldCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testEmptyImagesPassValidation() {
        FieldCreateDTO dto = new FieldCreateDTO(
                "Cancha de Prueba", "Calle 123", UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS), List.of()
        );

        Set<ConstraintViolation<FieldCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
}
