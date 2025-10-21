package ar.uba.fi.gestion.trippy.publication;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.util.HashMap;
import java.util.Map;

@Entity
@DiscriminatorValue("RESTAURANT") // Valor único para la columna "tipo_publicacion"
public class Restaurant extends Publication {

    // --- Campos específicos ---
    private String cuisineType; // "tipo de cocina"
    private String priceRange;  // "rango de precios" (ej. "$, $$, $$$")
    private String openingHours; // "horarios de apertura"
    private String menuUrl;      // "subo el menú"

    // ... constructores, getters y setters ...
    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();
        details.put("cuisineType", this.cuisineType);
        details.put("priceRange", this.priceRange);
        // ... poner todos los campos específicos de restaurante
        return details;
    }
}