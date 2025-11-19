package ar.uba.fi.gestion.trippy.reviewQualification;

public record ReviewQualificationStatusDTO (
    String reviewerEmail,
    QualificationType feedbackType
) {
    public String getReviewerEmail() { return reviewerEmail; }
    public QualificationType getFeedbackType() { return feedbackType; }

    public ReviewQualificationStatusDTO(String reviewerEmail, QualificationType feedbackType) {
        this.reviewerEmail = reviewerEmail;
        this.feedbackType = feedbackType;
    }
}
