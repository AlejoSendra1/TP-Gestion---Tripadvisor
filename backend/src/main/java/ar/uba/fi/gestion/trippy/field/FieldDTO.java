package ar.uba.fi.gestion.trippy.field;

import java.util.ArrayList;
import java.util.List;

import ar.uba.fi.gestion.trippy.FieldSchedule.FieldScheduleDTO;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.user.UserZones;
import io.swagger.v3.oas.annotations.media.Schema;

public class FieldDTO {

    @Schema(description = "ID de la cancha")
    private Long id;

    @Schema(description = "Email del dueño del establecimiento", example = "owner1@field1.com")
    private String ownerEmail;

    @Schema(description = "Nombre", example = "Los Botines")
    private String name;

    @Schema(description = "Breve descripcion del lugar")
    private String description;
    @Schema(description = "Direccion", example="Los Polvorines 1200")
    private String location;
    @Schema(description = "Zona", example = "FLORENCIO_VARELA")
    private UserZones zone;
    @Schema(description = "Precio",example = "2500")
    private Integer price;
    @Schema(description = "Caracteristicas",example = "[\"GRASS\", \"ARTIFICIAL_TURF\", \"ROOF\"]" )
    private List<String> features;
    @Schema(description = "Horarios disponibles")
    private FieldScheduleDTO schedule;
    @Schema(description = "ID de Reseñas", example = "[101, 102, 103]")
    private List<Long> reviews;
    @Schema(description = "ID de Reservas", example = "[101, 102, 103]")
    private List<Long> reservations;
    @Schema(description = "Fotos del lugar", example = "[\"https://example.com/1.jpg\", \"https://example.com/2.jpg\"]")
    private List<String> images;

    public FieldDTO(Field field) {
        this.id = field.getId();
        this.ownerEmail = field.getOwner().getEmail();
        this.name = field.getName();
        this.description = field.getDescription();
        this.location = field.getLocation();
        this.zone = field.getZone();
        this.price = field.getPrice() != null ? field.getPrice().intValue() : null;
        this.features = field.getFeatures()
                .stream()
                .map(f -> f.toString())
                .toList();
        this.schedule = new FieldScheduleDTO(field.getFieldSchedule());
        this.reviews = new ArrayList<>(field.getReviews());
        this.reservations = new ArrayList<>(field.getReservations().stream().map(Reservation::getId).toList());
        this.images = new ArrayList<>(field.getImages());
    }

    public Long getId() {
        return id;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public UserZones getZone() {
        return zone;
    }

    public Integer getPrice() {
        return price;
    }

    public List<String> getFeatures() {
        return features;
    }

    public FieldScheduleDTO getSchedule() {
        return schedule;
    }

    public List<Long> getReviews() {
        return reviews;
    }

    public List<Long> getReservations() {
        return reservations;
    }

    public List<String> getImages() {
        return images;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setZone(UserZones zone) {
        this.zone = zone;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public void setSchedule(FieldScheduleDTO schedule) {
        this.schedule = schedule;
    }

    public void setReviews(List<Long> reviews) {
        this.reviews = reviews;
    }

    public void setReservations(List<Long> reservations) {
        this.reservations = reservations;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }
}
