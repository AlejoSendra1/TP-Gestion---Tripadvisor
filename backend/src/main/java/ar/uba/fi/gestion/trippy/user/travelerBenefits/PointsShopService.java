package ar.uba.fi.gestion.trippy.user.travelerBenefits;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ar.uba.fi.gestion.trippy.common.exception.InsufficientPointsException;
import ar.uba.fi.gestion.trippy.common.exception.InvalidActionException;
import ar.uba.fi.gestion.trippy.publication.PublicationService;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.UserService;
import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class PointsShopService {

    private final OwnItemsRepository ownItemsRepository;
    private final UserService userService;
    private final ShopItemsRepository shopItemsRepository;
    private final PublicationService publicationService;

    public PointsShopService(
            OwnItemsRepository ownItemsRepository,
            UserService userService,
            ShopItemsRepository shopItemsRepository,
            PublicationService publicationService) {
        this.ownItemsRepository = ownItemsRepository;
        this.publicationService = publicationService;
        this.userService = userService;
        this.shopItemsRepository = shopItemsRepository;
    }

    public OwnItem purchaseBenefit(String benefitTitle) {
        Traveler traveler = (Traveler) userService.getCurrentAuthenticatedUser();

        ShopItem item = shopItemsRepository.findBytitle(benefitTitle)
                .orElseThrow(() -> new EntityNotFoundException("item not found"));

        if (!ownItemsRepository.existsByTravelerAndShopItem(traveler, item)) {
            throw new InvalidActionException("Can't have more than one of the same item");
        }

        if (traveler.getPoints() < item.getPointsRequired()) {
            throw new InsufficientPointsException();
        } else {
            traveler.addPoints(-item.getPointsRequired());
        }

        OwnItem ownItem = new OwnItem(traveler, item);

        ownItemsRepository.save(ownItem);
        return ownItem;
    }

    public List<ShopItemDto> getActualUserShopStatus() {
        List<ShopItem> shopItems = shopItemsRepository.findAll();
        List<OwnItem> ownItems = ownItemsRepository
                .findByTraveler((Traveler) userService.getCurrentAuthenticatedUser());

        Set<String> ownedItemIds = ownItems.stream()
                .map(OwnItem::getId).map(OwnItemId::getshopItemTitle) // or whatever your ID field is
                .collect(Collectors.toSet());

        // Map shop items to DTOs
        return shopItems.stream()
                .map(shopItem -> new ShopItemDto(
                        shopItem.getTitle(),
                        shopItem.getPointsRequired(),
                        shopItem.getIcon(),
                        shopItem.getDescription(),
                        ownedItemIds.contains(shopItem.getTitle()) // check if user owns it
                ))
                .collect(Collectors.toList());
    }

    public double getActualUserReservationCost(Long publicationId) {
        List<OwnItem> ownedItems = ownItemsRepository
                .findByTraveler((Traveler) userService.getCurrentAuthenticatedUser());
        Traveler traveler = (Traveler) userService.getCurrentAuthenticatedUser();
        PublicationDetailDTO publication = publicationService.getPublicationById(publicationId);

        // no me iporta nada
        double modiefiedCost = (1 - traveler.getDiscountPercentage() / 100) * publication.price(); // descuento de nivel
        for (OwnItem ownedItem : ownedItems) {
            // ALOJAMIENTOS
            if (ownedItem.getShopItem().getTitle().equals("Noche gratis")
                    && publication.publicationType().equals("ALOJAMIENTO")) {
                return 0;
            }
            if (ownedItem.getShopItem().getTitle().equals("Desayuno buffet")
                    && publication.publicationType().equals("ALOJAMIENTO")) {
                modiefiedCost -= 10;
            }
            if (ownedItem.getShopItem().getTitle().equals("Descuento 20% Hotel")
                    && publication.publicationType().equals("ALOJAMIENTO")) {
                modiefiedCost = modiefiedCost * 0.8;
            }
            // RESTO
            if (ownedItem.getShopItem().getTitle().equals("Cena para dos")
                    && publication.publicationType().equals("RESTAURANTE")) {
                modiefiedCost = modiefiedCost - 2; // todo es mas compleja la cosa
            }
            if (ownedItem.getShopItem().getTitle().equals("Descuento 50% en cuenta")
                    && publication.publicationType().equals("RESTAURANTE")) {
                modiefiedCost = modiefiedCost * 0.5;
            }
            // TOURS
            // COWORK
        }

        return modiefiedCost;
    }

}