package ar.uba.fi.gestion.trippy.reviewQualification;

import ar.uba.fi.gestion.trippy.review.Review;
import ar.uba.fi.gestion.trippy.user.Traveler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewQualificationRepository extends JpaRepository<ReviewQualification, ReviewQualificationId> {
    Optional<ReviewQualification> findByReviewIdAndQualifierId(Long reviewId, Long travelerId);

    Optional<ReviewQualification> findByReviewAndQualifier(Review review, Traveler traveler);

    List<ReviewQualification> findByQualifierId(Long travelerId);

    // Count likes for a specific review
    @Query("SELECT COUNT(rq) FROM ReviewQualification rq WHERE rq.review.id = :reviewId AND rq.feedbackType = 'USEFULL'")
    long countPositiveQualifByReviewId(@Param("reviewId") Long reviewId);

    // Count dislikes for a specific review
    @Query("SELECT COUNT(rq) FROM ReviewQualification rq WHERE rq.review.id = :reviewId AND rq.feedbackType = 'NOT_USEFULL'")
    long countNegativeQualifByReviewId(@Param("reviewId") Long reviewId);
}
