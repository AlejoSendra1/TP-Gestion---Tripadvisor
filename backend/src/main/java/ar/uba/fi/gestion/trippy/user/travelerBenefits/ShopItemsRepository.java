package ar.uba.fi.gestion.trippy.user.travelerBenefits;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopItemsRepository extends JpaRepository<ShopItem, String> {
    Optional<ShopItem> findBytitle(String benefittitle);
}