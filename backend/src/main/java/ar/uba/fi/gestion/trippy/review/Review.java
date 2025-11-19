package ar.uba.fi.gestion.trippy.review;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.user.Traveler;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private Traveler reviewer;

    @Column(nullable = false)
    private Short publicationRating;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reviewContent;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    public Review() {
    }

    public Review(Publication publication, Traveler creator, Short rating, String content) {
        this.publication = publication;
        this.reviewer = creator;
        this.publicationRating = rating;
        this.reviewContent = content;
    }

    public Long getId() {
        return reviewId;
    }

    public Publication getPublication() {
        return publication;
    }

    public Traveler getReviewer() {
        return reviewer;
    }

    public Short getPublicationRating() {
        return publicationRating;
    }

    public String getReviewContent() {
        return reviewContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
