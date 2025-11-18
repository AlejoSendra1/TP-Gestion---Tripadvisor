package ar.uba.fi.gestion.trippy.reviewQualification;
import ar.uba.fi.gestion.trippy.review.Review;
import ar.uba.fi.gestion.trippy.user.Traveler;
import jakarta.persistence.*;

@Entity
@IdClass(ReviewQualificationId.class)
public class ReviewQualification {

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;  // Removed "final"

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private Traveler qualifier;  // Removed "final"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QualificationType feedbackType;

    public ReviewQualification() {}

    ReviewQualification(Review review, Traveler qualifier,QualificationType feedbackType){
        this.review = review;
        this.qualifier = qualifier;
        this.feedbackType= feedbackType;
    }

    public Review getReview() { return review; }
    public void setReview(Review review) { this.review = review; }

    public Traveler getQualifier() { return qualifier; }
    public void setQualifier(Traveler qualifier) { this.qualifier = qualifier; }

    public QualificationType getFeedbackType() { return feedbackType; }
    public void setFeedbackType(QualificationType feedbackType) { this.feedbackType = feedbackType; }
}