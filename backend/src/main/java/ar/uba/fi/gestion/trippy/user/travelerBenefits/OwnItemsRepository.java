package ar.uba.fi.gestion.trippy.user.travelerBenefits;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import ar.uba.fi.gestion.trippy.user.Traveler;

public interface OwnItemsRepository extends JpaRepository<OwnItem, Long> {
        List<OwnItem> findByTraveler(Traveler traveler);

        boolean existsByTravelerAndShopItem(Traveler traveler, ShopItem shopItem);
}