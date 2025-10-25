package ar.uba.fi.gestion.trippy.publication;


import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.HashMap;
import java.util.Map;


@Entity
@DiscriminatorValue("RESTAURANT")
public class Restaurant extends Publication {

    private String cuisineType;
    private String priceRange;
    private String openingHours;
    private String menuUrl;

    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();
        details.put("cuisineType", this.cuisineType);
        details.put("priceRange", this.priceRange);
        details.put("openingHours", this.openingHours);
        details.put("menuUrl", this.menuUrl);
        return details;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }
    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }
    public void setOpeningHours(String openingHours) {
        this.openingHours = openingHours;
    }
    public void setMenuUrl(String menuUrl) {
        this.menuUrl = menuUrl;
    }

}