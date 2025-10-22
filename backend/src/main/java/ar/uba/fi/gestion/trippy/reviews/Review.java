package ar.uba.fi.gestion.trippy.reviews;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Entity
public class Review implements Serializable {

    @Id
    @GeneratedValue
    private Long id;

    @Min(1)
    @Max(10)
    @Column(nullable = false)
    private Short score;

    private String comment;

    public Review() {}

    public Review(Long id, Short score, String comment) {
        this.id = id;
        this.score = score;
        this.comment = comment;
    }

    public Review(Short score, String comment) {
        this.score = score;
        this.comment = comment;
    }

    public Long getId() { return id; }

    public Short getScore() { return score; }

    public String getComment() { return comment; }

}
