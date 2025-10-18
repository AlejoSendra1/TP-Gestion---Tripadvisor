package ar.uba.fi.ingsoft1.todo_template.field;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ar.uba.fi.ingsoft1.todo_template.reviews.ReviewCreateDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

public class TestReviewCreateDTO {
    private Validator validator;

    @BeforeEach
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    public ReviewCreateDTO buildValidReviewCreateDTO() {
        return new ReviewCreateDTO(
                1L,
                (short) 5,
                "Excelente cancha, muy bien mantenida."
        );
    }

    @Test
    public void testValidReviewCreateDTOPassValidation() {
        ReviewCreateDTO review = buildValidReviewCreateDTO();
        var violations = validator.validate(review);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testNullFieldIdFailsValidation() {
        ReviewCreateDTO review = new ReviewCreateDTO(
                null,
                (short) 5,
                "Excelente cancha, muy bien mantenida."
        );
        var violations = validator.validate(review);
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("field_id")));
    }

    @Test
    public void testEmptyCommentPassValidation() {
        ReviewCreateDTO review = new ReviewCreateDTO(
                1L,
                (short) 5,
                ""
        );
        var violations = validator.validate(review);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testInvalidRatingFailsValidation() {
        ReviewCreateDTO review = new ReviewCreateDTO(
                1L,
                (short) 6, // Rating fuera del rango válido
                "Excelente cancha, muy bien mantenida."
        );
        var violations = validator.validate(review);
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("score")));
    }

    @Test
    public void testNegativeRatingFailsValidation() {
        ReviewCreateDTO review = new ReviewCreateDTO(
                1L,
                (short) -1, // Rating negativo
                "Pésima cancha, muy mal mantenida."
        );
        var violations = validator.validate(review);
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("score")));
    }
}
