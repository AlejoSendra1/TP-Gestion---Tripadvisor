package ar.uba.fi.ingsoft1.todo_template.reviews;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Contenido reseña", example = """
        {"id": 123,
          "score": 4,
          "comment": "¡Excelente experiencia en el campo! Lo recomiendo"
        }
        """)
public record ReviewDTO(
        long id,
        Short score,
        String comment
) {
    public ReviewDTO(Review review) {
        this(review.getId(), review.getScore(), review.getComment());
    }

    public Review asReview() {
        return new Review(id, score, comment);
    }
}

