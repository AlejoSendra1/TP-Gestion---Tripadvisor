package ar.uba.fi.gestion.trippy.publication;

import jakarta.persistence.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@DiscriminatorValue("COWORKING")
public class Coworking extends Publication {

    // --- Campos específicos ---
    private double pricePerDay;
    private double pricePerMonth;

    @ElementCollection // Lista de servicios
    @CollectionTable(name = "coworking_services", joinColumns = @JoinColumn(name = "publication_id"))
    @Column(name = "service")
    private List<String> services; // "servicios (ej. Wi-Fi...)"

    // ... constructores, getters y setters ...
    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();

        details.put("pricePerDay", this.pricePerDay);
        details.put("pricePerMonth", this.pricePerMonth);
        details.put("services", this.services); // La lista completa de servicios

        return details;
    }
}