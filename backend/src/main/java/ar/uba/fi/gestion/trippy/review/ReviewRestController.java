package ar.uba.fi.gestion.trippy.review;

import ar.uba.fi.gestion.trippy.review.dto.CreateReviewDTO;
import ar.uba.fi.gestion.trippy.review.dto.ReviewResponseDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@Tag(name = "4 - reviews")
public class ReviewRestController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewRestController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> postReview(@RequestBody CreateReviewDTO createDTO) {
        ReviewResponseDTO publication = reviewService.createReview(createDTO);
        return ResponseEntity.ok(publication);
    }


    @GetMapping("/publication/{publicationId}")
    public ResponseEntity<Page<ReviewResponseDTO>> getReviewsByPublication(
            @Valid @ParameterObject Pageable pageable,
            @PathVariable Long publicationId
    ) {
        Page<ReviewResponseDTO> reviews = reviewService.getReviewsByPublicationId(publicationId,pageable);
        return ResponseEntity.ok(reviews);
    }

}
