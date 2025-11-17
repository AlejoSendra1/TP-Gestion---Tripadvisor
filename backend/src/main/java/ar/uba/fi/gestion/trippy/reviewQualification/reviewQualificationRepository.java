package ar.uba.fi.gestion.trippy.reviewQualification;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface reviewQualificationRepository extends JpaRepository<reviewQualification, Long> {

    Optional<reviewQualification> findByReviewIdAndUserEmail(String reviewId, String userEmail);

    List<reviewQualification> findByUserEmailAndReviewIdIn(String userEmail, List<String> reviewIds);
}
