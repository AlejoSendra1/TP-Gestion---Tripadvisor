package ar.uba.fi.gestion.trippy.reviewQualification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class reviewQualificationRestController {

    private final reviewQualificationService reviewQualificationService;

    public reviewQualificationRestController(reviewQualificationService reviewQualificationService) {
        this.reviewQualificationService = reviewQualificationService;
    }

    @PostMapping("/qualification")
    public ResponseEntity<Integer> UpdateReviewUtilityQualification(
            @RequestBody reviewQualificationDTO dto) {
        return ResponseEntity.ok(reviewQualificationService.updateFeedback(dto));
    }

    /*
    @GetMapping("/{userId}")
    public ResponseEntity<List<reviewQualificationDTO>> getUserFeedbacks(
            @PathVariable Long publicationId,
            @RequestParam String userEmail) {

    }
    */

}