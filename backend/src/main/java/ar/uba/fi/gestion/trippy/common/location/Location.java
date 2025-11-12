package ar.uba.fi.gestion.trippy.common.location;


import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;


/**
 * Representa una ubicación física como un "Value Object" incrustable.
 * Se usa para agrupar campos de dirección dentro de otras entidades (ej. Publication).
 * * Esta clase no tiene tabla propia, sus campos se "aplanan" en la tabla
 * de la entidad que la contenga.
 */
@Embeddable
public class Location {

    @Column(columnDefinition = "TEXT")
    private String streetAddress;
    @Column(columnDefinition = "TEXT")
    private String city;
    @Column(columnDefinition = "TEXT")
    private String state; // Provincia o Estado
    @Column(columnDefinition = "TEXT")
    private String country;
    @Column(name = "zip_code")
    private String zipCode;

    public Location() {
    }

    public Location(String streetAddress, String city, String state, String country, String zipCode) {
        this.streetAddress = streetAddress;
        this.city = city;
        this.state = state;
        this.country = country;
        this.zipCode = zipCode;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
}