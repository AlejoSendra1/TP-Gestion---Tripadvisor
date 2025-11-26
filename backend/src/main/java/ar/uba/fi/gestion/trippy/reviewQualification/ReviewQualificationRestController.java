package ar.uba.fi.gestion.trippy.reviewQualification;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@Tag(name = "5 - Review Qualification")
public class ReviewQualificationRestController {

    private final ReviewQualificationService reviewQualificationService;

    public ReviewQualificationRestController(ReviewQualificationService reviewQualificationService) {
        this.reviewQualificationService = reviewQualificationService;
    }

    @PostMapping("/qualification")
    public ResponseEntity<Long> UpdateReviewUtilityQualification(
            @RequestBody ReviewQualificationDTO dto) {
        return ResponseEntity.ok(reviewQualificationService.updateQualification(dto));
    }

    @GetMapping("/qualification/{publicationId}/{currentUserEmail}") // deberia obtener el mail del contexto y quitarlo del path, pero bueno, es todo un tema
    public ResponseEntity<List<ReviewQualificationStatusDTO>> getUserReviewQualificationsByPublication(
            @PathVariable Long publicationId,
            @PathVariable String currentUserEmail) {
        return ResponseEntity.ok(
                reviewQualificationService.getUserReviewQualificationsByPublication(publicationId, currentUserEmail));
    }

    @GetMapping("/qualification/{reviewId}")
    public ResponseEntity<Long> getReviewQualification(
            @PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewQualificationService.getReviewQualification(reviewId));
    }

}