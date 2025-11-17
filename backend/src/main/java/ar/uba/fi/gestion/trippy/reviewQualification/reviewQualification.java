package ar.uba.fi.gestion.trippy.reviewQualification;
import ar.uba.fi.gestion.trippy.review.Review;
import ar.uba.fi.gestion.trippy.user.Traveler;
import jakarta.persistence.*;

@Entity
public class reviewQualification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Traveler reviewer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QualificationType feedbackType;

    public Long getId() {return id;}

    public Review getReview() {return review;}

    public Traveler getReviewer() {return reviewer;}

    public QualificationType getFeedbackType() {return feedbackType;}
}