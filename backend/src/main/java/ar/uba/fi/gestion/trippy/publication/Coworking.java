package ar.uba.fi.gestion.trippy.publication;


import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Entity
@DiscriminatorValue("COWORKING")
public class Coworking extends Publication {

    private double pricePerDay;
    private double pricePerMonth;

    @ElementCollection // Lista de servicios
    @CollectionTable(name = "coworking_services", joinColumns = @JoinColumn(name = "publication_id"))
    @Column(name = "service")
    private List<String> services; // "servicios (ej. Wi-Fi...)"

    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();

        details.put("pricePerDay", this.pricePerDay);
        details.put("pricePerMonth", this.pricePerMonth);

        List<String> serviceList = new ArrayList<>(this.services);
        details.put("services", serviceList);

        return details;
    }
}