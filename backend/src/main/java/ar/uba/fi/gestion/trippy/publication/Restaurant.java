package ar.uba.fi.gestion.trippy.publication;


import jakarta.persistence.Column;
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
    // Reutiliza la columna existente "capacity" del Hotel
    @Column(name = "capacity")
    private Integer capacity;

    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();
        details.put("cuisineType", this.cuisineType);
        details.put("priceRange", this.priceRange);
        details.put("openingStart", this.openingStart);
        details.put("openingEnd", this.openingEnd);
        details.put("menuUrl", this.menuUrl);
        details.put("capacity", this.capacity);
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

    // Nuevo campo reutilizado
    public Integer getCapacity() {
        return capacity;
    }
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}