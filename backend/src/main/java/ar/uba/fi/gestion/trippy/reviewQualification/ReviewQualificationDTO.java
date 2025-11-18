package ar.uba.fi.gestion.trippy.reviewQualification;

public record ReviewQualificationDTO (
    Long publicationId,
    String reviewerEmail,
    String qualificatorEmail,
    QualificationType feedbackType
) {
    public Long getPublicationId() { return publicationId; }
    public String getReviewerEmail() { return reviewerEmail; }
    public String getQualificatorEmail() { return qualificatorEmail; }
    public QualificationType getFeedbackType() { return feedbackType; }
}
