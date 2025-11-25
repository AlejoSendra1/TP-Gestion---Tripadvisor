package ar.uba.fi.gestion.trippy.review;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.reviewQualification.ReviewQualification;
import ar.uba.fi.gestion.trippy.user.Traveler;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByPublicationAndReviewer(Publication publication, Traveler reviewer);

    Page<Review> findByPublicationId(Long publicationId, Pageable pageable);

    Page<Review> findByReviewerId(Long reviewerId,Pageable pageable);

    Optional<Review> findByPublicationAndReviewer(Publication publication, Traveler reviewer);
}
