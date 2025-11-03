package ar.uba.fi.gestion.trippy.review.dto;

import jakarta.validation.constraints.*;

public record CreateReviewDTO(
        @NotNull(message = "Publication ID is required")
        String publicationId,

        @NotBlank(message = "User email is required")
        @Email(message = "Invalid email format")
        String userEmail,

        @NotNull(message = "Rating is required")
        //@Min(value = 1, message = "Rating must be at least 1")
        //@Max(value = 5, message = "Rating must be at most 5")
        String rating,

        @NotBlank(message = "Review content is required")
        @Size(min = 10, max = 1000, message = "Review must be between 10 and 1000 characters")
        String reviewContent
) {
    public String getReviewerEmail() {
        return this.userEmail;
    }
}