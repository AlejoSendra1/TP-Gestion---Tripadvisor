package ar.uba.fi.gestion.trippy.common.location; // o ...trippy.publication

import jakarta.persistence.Embeddable;

@Embeddable // <-- Le dice a JPA que esta clase puede ser "incrustada"
public class Location {

    private String streetAddress;
    private String city;
    private String state;
    private String country;
    private String zipCode;

    // Opcional pero recomendado para mapas:
    // private double latitude;
    // private double longitude;

    // --- IMPORTANTE ---
    // JPA necesita un constructor vacío
    public Location() {
    }

    // ... constructor con parámetros, getters y setters ...
}