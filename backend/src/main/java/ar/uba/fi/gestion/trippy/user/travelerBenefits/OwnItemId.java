package ar.uba.fi.gestion.trippy.user.travelerBenefits;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OwnItemId implements Serializable {

    @Column(name = "traveler_id")
    private Long travelerId;

    @Column(name = "shop_item_title")
    private String shopItemtitle;

    // Constructor vacío requerido
    public OwnItemId() {
    }

    public OwnItemId(Long travelerId, String shopItemtitle) {
        this.travelerId = travelerId;
        this.shopItemtitle = shopItemtitle;
    }

    // Getters y Setters
    public Long getTravelerId() {
        return travelerId;
    }

    public void setTravelerId(Long travelerId) {
        this.travelerId = travelerId;
    }

    public String getshopItemTitle() {
        return shopItemtitle;
    }

    public void setshopItemtitle(String shopItemtitle) {
        this.shopItemtitle = shopItemtitle;
    }

    // equals y hashCode son CRÍTICOS para composite keys
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        OwnItemId that = (OwnItemId) o;
        return Objects.equals(travelerId, that.travelerId) &&
                Objects.equals(shopItemtitle, that.shopItemtitle);
    }

    @Override
    public int hashCode() {
        return Objects.hash(travelerId, shopItemtitle);
    }
}