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
    // Reemplazamos el campo único by dos campos separados
    private String openingStart; // formato "HH:mm" o cualquier cadena que uses
    private String openingEnd;
    private String menuUrl;

    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();
        details.put("cuisineType", this.cuisineType);
        details.put("priceRange", this.priceRange);
        details.put("openingStart", this.openingStart);
        details.put("openingEnd", this.openingEnd);
        details.put("menuUrl", this.menuUrl);
        return details;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }
    public void setPriceRange(String priceRange) {
        this.priceRange = priceRange;
    }

    public String getOpeningStart() {
        return openingStart;
    }
    public void setOpeningStart(String openingStart) {
        this.openingStart = openingStart;
    }
    public String getOpeningEnd() {
        return openingEnd;
    }
    public void setOpeningEnd(String openingEnd) {
        this.openingEnd = openingEnd;
    }

    public void setMenuUrl(String menuUrl) {
        this.menuUrl = menuUrl;
    }

}