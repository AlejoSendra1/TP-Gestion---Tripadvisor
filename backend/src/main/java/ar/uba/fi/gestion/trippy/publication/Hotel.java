package ar.uba.fi.gestion.trippy.publication;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.util.HashMap;
import java.util.Map;

@Entity
@DiscriminatorValue("HOTEL") // Valor que se guarda en la columna "tipo_publicacion"
public class Hotel extends Publication {

    // --- Campos específicos de Hotel ---
    private int roomCount;
    private int capacity;

    // ... getters y setters para estos campos ...
    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();
        details.put("roomCount", this.roomCount);
        details.put("capacity", this.capacity);
        return details;
    }
}