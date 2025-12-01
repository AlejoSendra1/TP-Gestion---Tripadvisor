package ar.uba.fi.gestion.trippy.user.travelerBenefits;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/benefits")
public class PointsShopController {

    @Autowired
    private PointsShopService pointsShopService;

    @PostMapping("/{itemTitle}/purchase")
    public ResponseEntity<OwnItem> purchaseReward(
            @PathVariable String itemTitle) {
        OwnItem benefit = pointsShopService.purchaseBenefit(itemTitle);
        return ResponseEntity.ok(benefit);
    }

    @GetMapping("/my-items")
    public ResponseEntity<List<ShopItemDto>> getMyBenefits() {
        List<ShopItemDto> items = pointsShopService.getActualUserShopStatus();
        items.sort((o1, o2)
                -> o1.getPrice().compareTo(
                o2.getPrice()));
        return ResponseEntity.ok(items);
    }

    @GetMapping("/my-discount/{publicationId}")
    public ResponseEntity<Double> getPriceForMe(
            @PathVariable Long publicationId) {
        return ResponseEntity.ok(pointsShopService.getActualUserReservationCost(publicationId));
    }
}