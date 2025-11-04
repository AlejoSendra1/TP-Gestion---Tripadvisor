package ar.uba.fi.gestion.trippy.review;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.user.Traveler;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByPublicationAndReviewer(Publication publication, Traveler reviewer);

    Page<Review> findByPublicationId(Long publicationId, Pageable pageable);
}
