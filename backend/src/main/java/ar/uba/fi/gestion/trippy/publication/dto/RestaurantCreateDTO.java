package ar.uba.fi.gestion.trippy.publication.dto;

import ar.uba.fi.gestion.trippy.common.location.Location;
import java.util.List;

// DTO para US #24 (Publicar Restaurant)
public record RestaurantCreateDTO(
        // Campos comunes
        String title,
        String description,
        double price, // Precio base (quizás costo promedio por persona)
        Location location,
        String mainImageUrl,
        List<String> imageUrls,

        // Campos específicos de Restaurant
        String cuisineType,
        String priceRange, // Ej: "$$ - $$$"
        String openingHours,
        String menuUrl
) {}