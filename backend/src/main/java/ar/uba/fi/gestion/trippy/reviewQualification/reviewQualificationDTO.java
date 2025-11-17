package ar.uba.fi.gestion.trippy.reviewQualification;

public record reviewQualificationDTO (
    String reviewId,
    String userEmail,
    QualificationType feedbackType
) {
    public String getReviewId() { return reviewId; }
    public String getUserEmail() { return userEmail; }
    public QualificationType getFeedbackType() { return feedbackType; }
}
