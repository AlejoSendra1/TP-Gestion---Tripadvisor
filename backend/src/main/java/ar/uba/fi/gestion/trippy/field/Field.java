package ar.uba.fi.gestion.trippy.field;

import java.util.List;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Optional;

import ar.uba.fi.gestion.trippy.FieldSchedule.FieldSchedule;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserZones;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "fields")
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner", nullable = false)
    private User owner;

    @NotEmpty(message = "La cancha debe tener un nombre")
    @Column(nullable = false)
    private String name;

    private String description;

    private String location;

    @NotNull(message = "La cancha debe tener una zona asignada")
    @Enumerated(EnumType.STRING)
    private UserZones zone;

    @Positive(message = "El precio debe ser un valor positivo")
    @Column
    private Double price;

    @Column
    private Boolean isAvailable = true;

    @OneToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "schedule_id", nullable = false, unique = true)
    private FieldSchedule schedule;

    @NotEmpty(message = "La cancha debe tener al menos una característica como el tipo de superficie")
    @ElementCollection
    @CollectionTable(name = "field_features", joinColumns = @JoinColumn(name = "field_id"))
    @Column(name = "feature", nullable = false)
    @Enumerated(EnumType.STRING)
    private List<FieldFeatures> features;

    @ElementCollection
    @CollectionTable(name = "field_images", joinColumns = @JoinColumn(name = "field_id"))
    @Column(name = "image")
    private List<String> images;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Reservation> reservations;

    @ElementCollection
    @CollectionTable(name = "field_reviews", joinColumns = @JoinColumn(name = "field_id"))
    private List<Long> reviews;

    public Field() {}

    public Field(Long id, String name, User owner, String location, UserZones zone, List<FieldFeatures> features, Optional<List<String>> images) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.location = location;
        this.zone = zone;
        this.features = features;
        this.images = images.orElse(new ArrayList<>());

        this.schedule = new FieldSchedule();
        this.reservations = new ArrayList<>();
        this.reviews = new ArrayList<>();
    }

    public Field(Long id, User owner, String name, String location, UserZones zone, List<FieldFeatures> features) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.location = location;
        this.zone = zone;
        this.features = features;

        this.schedule = new FieldSchedule();
        this.images = new ArrayList<>();
        this.reservations = new ArrayList<>();
        this.reviews = new ArrayList<>();
    }

    public Field(User owner, String name, String location, UserZones zone, List<FieldFeatures> features, List<String> images) {
        this.name = name;
        this.owner = owner;
        this.location = location;
        this.zone = zone;
        this.features = features;

        this.schedule = new FieldSchedule();
        this.images = images != null ? images : new ArrayList<>();
        this.reservations = new ArrayList<>();
        this.reviews = new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public User getOwner() {
        return owner;
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

    public Double getPrice() {
        return price;
    }

    public List<FieldFeatures> getFeatures() {
        return features;
    }

    public List<String> getImages() {
        return images;
    }

    public FieldSchedule getSchedule() {
        return schedule;
    }

    public List<Reservation> getReservations() {
        return reservations;
    }

    public List<Long> getReviews() {
        return reviews;
    }

    public FieldSchedule getFieldSchedule() {
        return schedule;
    }

    public Boolean IsAvailable() {
        return isAvailable;
    }

    public void setId(Long id) {
        this.id = id;
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

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setFeatures(List<FieldFeatures> features) {
        this.features = features;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public void setSchedule(FieldSchedule schedule) {
        this.schedule = schedule;
    }

    public void setStartHour(String startHour) {
        this.schedule.setStartHour(startHour);
    }

    public void setEndHour(String endHour) {
        this.schedule.setEndHour(endHour);
    }

    public void setDays(List<DayOfWeek> days) {
        this.schedule.setDays(days);
    }

    public void setPredefDuration(int predefDuration) {
        this.schedule.setPredefDuration(predefDuration);
    }

    public void setReservations(List<Reservation> reservations) {
        this.reservations = reservations;
    }

    public void setReviews(List<Long> reviews) {
        this.reviews = reviews;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public void addReservation(Reservation reservation) { 
        this.reservations.add(reservation);
    }

    public void addReview(Long review) {
        this.reviews.add(review);
    }

    public void removeReservation(Long id) {
        this.reservations.removeIf(reservation -> reservation.getId().equals(id));
    }

    public double getWeeklyOcupation(List<Reservation> reservations) {
        if (reservations == null || reservations.isEmpty()) {
            return 0;
        }

        int total_hours = this.schedule.getTotalHours();
        int occupiedHours = this.schedule.getOccupiedHoursThisWeek(reservations);
        return occupiedHours / (double) total_hours;
    }

    public double getMonthlyOcupation(List<Reservation> reservations) {
        if (reservations == null || reservations.isEmpty()) {
            return 0;
        }

        int total_hours = this.schedule.getTotalHours() * 4; 
        int occupiedHours = this.schedule.getOccupiedHoursThisMonth(reservations);
        return occupiedHours / (double) total_hours;
    }
}
