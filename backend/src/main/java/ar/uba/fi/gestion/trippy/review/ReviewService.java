package ar.uba.fi.gestion.trippy.review;

import ar.uba.fi.gestion.trippy.review.dto.ReviewResponseDTO;
import ar.uba.fi.gestion.trippy.user.Traveler;
import jakarta.persistence.EntityNotFoundException;
import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.publication.PublicationService;
import ar.uba.fi.gestion.trippy.review.dto.CreateReviewDTO;
import ar.uba.fi.gestion.trippy.user.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PublicationService publicationService;
    private final UserService userService;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, PublicationService publicationService, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.publicationService = publicationService;
        this.userService = userService;
    }

    public ReviewResponseDTO createReview(CreateReviewDTO data) {
        // 1. Fetch the publication
        Publication publication = publicationService.getPublicationById_(data.publicationId());

        // 2. Fetch the user
        Traveler user = (Traveler) userService.getUserByEmail(data.getReviewerEmail());

        // Optional: Check if user already reviewed this publication
        if (reviewRepository.existsByPublicationAndReviewer(publication, user)) {
            //throw new DuplicateReviewException("You already reviewed this publication");
            throw new EntityNotFoundException("You already reviewed this publication");
        }

        // 3. Create the review entity
        Review review = new Review(
                publication,
                user,
                data.rating(),
                data.reviewContent()
        );

        // 4. Save and return
        Review savedReview = reviewRepository.save(review);
        return mapToResponseDTO(savedReview);
    }

    private ReviewResponseDTO mapToResponseDTO(Review review) {
        return new ReviewResponseDTO(
                review.getReviewer().getFirstName(),
                review.getPublicationRating(),
                review.getReviewContent()
        );
    }

    public Page<ReviewResponseDTO> getReviewsByPublicationId(Long publicationId, @Valid Pageable pageable) {
        return reviewRepository.findByPublicationId(publicationId,pageable)
                .map(this::mapToResponseDTO);
    }

}
