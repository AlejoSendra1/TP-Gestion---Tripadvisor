package ar.uba.fi.gestion.trippy.publication.dto;

import ar.uba.fi.gestion.trippy.common.location.Location;
import java.util.List;
import java.util.Map;

public record PublicationDetailDTO(
        Long id,
        String title,
        String description, // "descripción" [cite: 566]
        double price,       // "costos" [cite: 566]
        Location location,  // El objeto Location completo

        HostDTO host, // Un DTO simple con info del anfitrión (ej. nombre, foto)

        List<String> imageUrls, // "galería de fotos"
        List<ReviewDTO> reviews, // "reseñas"

        String publicationType, // "ALOJAMIENTO", "RESTAURANTE", etc.

        // Aquí está la magia:
        // Un mapa para poner los campos específicos
        // Ej: {"roomCount": 2} o {"cuisineType": "Italiana"}
        Map<String, Object> specificDetails
) {
    public record HostDTO(
            Long id,
            String name,
            String photoUrl // Incluimos el campo aunque no esté en User.java
            // Tu servicio lo pasará como 'null' por ahora,
            // ¡pero el frontend ya puede esperar este campo!
    ){}
}

// --- DTOs de ayuda que necesitarás crear ---

// DTO simple para una reseña
record ReviewDTO(Long id, String authorName, int rating, String comment) {}