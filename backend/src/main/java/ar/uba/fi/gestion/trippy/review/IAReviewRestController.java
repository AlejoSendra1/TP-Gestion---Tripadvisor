package ar.uba.fi.gestion.trippy.review;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ia/reviews")
public class IAReviewRestController {

    private final IAReviewService iaReviewService;

    public IAReviewRestController(IAReviewService iaReviewService) {
        this.iaReviewService = iaReviewService;
    }

    @GetMapping("/summary/{publicationId}")
    public ResponseEntity<String> getAISummary(@PathVariable Long publicationId) {
        return ResponseEntity.ok(iaReviewService.summarizeReviews(publicationId));
    }
}