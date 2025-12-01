package ar.uba.fi.gestion.trippy.user.travelerBenefits;

import ar.uba.fi.gestion.trippy.user.Traveler;
import jakarta.persistence.*;

@Entity
@Table(name = "own_items")
public class OwnItem {
    @EmbeddedId
    private OwnItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("travelerId")
    @JoinColumn(name = "user_id", nullable = false)
    private Traveler traveler;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("shopItemtitle")
    @JoinColumn(name = "shop_items_title", nullable = false)
    private ShopItem shopItem;

    public OwnItem(Traveler traveler, ShopItem shopItem) {
        this.traveler = traveler;
        this.shopItem = shopItem;
    }

    public OwnItemId getId() {
        return this.id;
    }

    public Traveler getTraveler() {
        return this.traveler;
    }

    public ShopItem getShopItem() {
        return this.shopItem;
    }

}
