package ar.uba.fi.ingsoft1.todo_template.field;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserZones;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class TestField {

    private Validator validator;

    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private Field buildValidDTO() {
        User user = new User(
                "Juan", "Pérez", "juan.perez@example.com",
                List.of(UserZones.AVELLANEDA), "123456", "hombre", "http://example.com/photo.jpg", (short) 30
        );
        return new Field(
                user, "Cancha de Prueba", "Calle 123", UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS, FieldFeatures.WIFI, FieldFeatures.PARKING),
                List.of("https://example.com/image1.jpg", "https://example.com/image2.jpg")
        );
    }

    @Test
    public void testValidField() {
        Field field = buildValidDTO();
        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testBlankNameFailsValidation() {
        Field field = new Field(
                null, "", "Calle 123", UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS), List.of("https://example.com/image1.jpg")
        );

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    public void testNullZoneFailsValidation() {
        Field field = new Field(
                null, "Cancha de Prueba", "Calle 123", null,
                List.of(FieldFeatures.GRASS), List.of("https://example.com/image1.jpg")
        );

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("zone")));
    }

    @Test
    public void testEmptyFeaturesFailsValidation() {
        Field field = new Field(
                null, "Cancha de Prueba", "Calle 123", UserZones.AVELLANEDA,
                List.of(), List.of("https://example.com/image1.jpg")
        );

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("features")));
    }

    @Test
    public void testNullImagesPassValidation() {
        Field field = new Field(
                null, "Cancha de Prueba", "Calle 123", UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS), null
        );

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testEmptyImagesPassValidation() {
        Field field = new Field(
                null, "Cancha de Prueba", "Calle 123", UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS), List.of()
        );

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testNonPositivePriceFailsValidation() {
        Field field = buildValidDTO();
        field.setPrice(-100.0);

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("price")));
    }

    @Test
    public void testValidPricePassesValidation() {
        Field field = buildValidDTO();
        field.setPrice(100.0);

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testSetNullFeaturesFailsValidation() {
        Field field = buildValidDTO();
        field.setFeatures(null);

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("features")));
    }

    @Test
    public void testSetEmptyFeaturesFailsValidation() {
        Field field = buildValidDTO();
        field.setFeatures(List.of());

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("features")));
    }

    @Test
    public void setNullZoneFailsValidation() {
        Field field = buildValidDTO();
        field.setZone(null);

        Set<ConstraintViolation<Field>> violations = validator.validate(field);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("zone")));
    }
}
