package ar.uba.fi.gestion.trippy.reviewQualification;

import ar.uba.fi.gestion.trippy.review.Review;
import ar.uba.fi.gestion.trippy.review.ReviewService;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewQualificationService {

    private final ReviewQualificationRepository feedbackRepository;
    private final UserService userService;
    private final ReviewService reviewService;

    public ReviewQualificationService(ReviewQualificationRepository feedbackRepository, UserService userService,
            ReviewService reviewService) {
        this.feedbackRepository = feedbackRepository;
        this.userService = userService;
        this.reviewService = reviewService;
    }

    @Transactional
    public Long updateQualification(ReviewQualificationDTO dto) {
        Review rw = reviewService.getReviewByPublicationIdAndReviewerEmail(
                dto.getPublicationId(), dto.getReviewerEmail());
        Traveler qualifier = (Traveler) userService.getUserByEmail(dto.getQualificatorEmail());

        ReviewQualification qualification = feedbackRepository
                .findByReviewAndQualifier(rw, qualifier)
                .orElse(new ReviewQualification(
                        rw,
                        qualifier,
                        dto.getFeedbackType()));

        if (qualification.getFeedbackType() != dto.getFeedbackType()) {
            qualification.setFeedbackType(dto.getFeedbackType());
        }

        if (dto.getFeedbackType() == QualificationType.NONE) {
            feedbackRepository.delete(qualification);
        } else {
            feedbackRepository.save(qualification);
        }

        return getReviewQualification(rw.getId());
    }

    public Long getReviewQualification(Long reviewId) {
        return feedbackRepository.countPositiveQualifByReviewId(reviewId)
                - feedbackRepository.countNegativeQualifByReviewId(reviewId);
    }

    public List<ReviewQualificationStatusDTO> getUserReviewQualificationsByPublication(Long publicationId,
            String currentUserEmail) {
        List<ReviewQualification> response = feedbackRepository.findByPublicationIdAndQualifierId(
                userService.getUserByEmail(currentUserEmail).getId(),
                publicationId);
        return response.stream()
                .map(this::mapToReviewQualificationStatusDTO)
                .collect(Collectors.toList());
    }

    private ReviewQualificationStatusDTO mapToReviewQualificationStatusDTO(
            ReviewQualification qualification) {
        Review review = qualification.getReview();
        Traveler reviewer = review.getReviewer();
        QualificationType feedbackType = qualification.getFeedbackType();
        return new ReviewQualificationStatusDTO(reviewer.getEmail(), feedbackType);
    }
}