package ar.uba.fi.gestion.trippy.publication;

import ar.uba.fi.gestion.trippy.common.location.Location;
import ar.uba.fi.gestion.trippy.user.User;
import jakarta.persistence.*;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "publication")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_publicacion") // Columna que dice qué tipo es
public abstract class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private double price; // Precio base (ej. por noche, por persona, etc.)

    @Embedded // El "struct" de Ubicación
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_user_id")
    private User host; // El Anfitrión (dueño)

    // --- Campos para DTOs ---

    private String mainImageUrl; // Para la tarjeta de la lista (US #43)

    @ElementCollection // Una lista simple de URLs de imágenes
    @CollectionTable(name = "publication_images", joinColumns = @JoinColumn(name = "publication_id"))
    @Column(name = "image_url")
    private List<String> imageUrls; // Para la galería de fotos (US #11)

    // ... constructores, getters y setters ...
    @Transient
    public abstract Map<String, Object> fetchSpecificDetails();

    // Getters y Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public double getPrice() {
        return price;
    }
    public void setPrice(double price) {
        this.price = price;
    }
    public Location getLocation() {
        return location;
    }
    public void setLocation(Location location) {
        this.location = location;
    }
    public User getHost() {
        return host;
    }
    public void setHost(User host) {
        this.host = host;
    }
    public String getMainImageUrl() {
        return mainImageUrl;
    }
    public void setMainImageUrl(String mainImageUrl) {
        this.mainImageUrl = mainImageUrl;
    }
    public List<String> getImageUrls() {
        return imageUrls;
    }
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    // specific details
    public void getSpecificDetails() {
        fetchSpecificDetails();
    }
}