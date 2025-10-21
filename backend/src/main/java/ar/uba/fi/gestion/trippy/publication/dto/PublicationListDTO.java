package ar.uba.fi.gestion.trippy.publication.dto;

// Un 'record' es ideal para DTOs.
// Es inmutable y ya incluye constructores, getters, equals() y hashCode().
public record PublicationListDTO(
        Long id,
        String title,
        double price,
        String city,       // Dato aplanado (location.getCity())
        String country,    // Dato aplanado (location.getCountry())
        String mainImageUrl,
        String publicationType // "Alojamiento", "Restaurante", etc.
) {
}