package ar.uba.fi.gestion.trippy.reviewQualification;
import ar.uba.fi.gestion.trippy.review.ReviewService;
import ar.uba.fi.gestion.trippy.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class reviewQualificationService {

    private final reviewQualificationRepository feedbackRepository;
    private final UserService userService;
    private final ReviewService reviewService;

    public reviewQualificationService(reviewQualificationRepository feedbackRepository, UserService userService, ReviewService reviewService) {
        this.feedbackRepository = feedbackRepository;
        this.userService = userService;
        this.reviewService = reviewService;
    }

    public Integer updateFeedback(reviewQualificationDTO dto) {
        reviewQualification qualification = feedbackRepository
                .findByReviewIdAndUserEmail(dto.getReviewId(), dto.getUserEmail())
                .orElse(new reviewQualification());

        if (dto.getFeedbackType() == QualificationType.NONE) {
            feedbackRepository.delete(qualification);
        } else {
            feedbackRepository.save(qualification);
        }
        return getReviewQualification(qualification.getReview().getId());
    }
    public Integer getReviewQualification(Long reviewId){
        feedbackRepository.getAllQualificationsByReviewId(reviewId);
        return 0;
    }


    public List<reviewQualification> getUserFeedbacksForPublication(String userEmail,
                                                                    List<String> reviewIds) {
        return feedbackRepository.findByUserEmailAndReviewIdIn(userEmail, reviewIds);
    }
}