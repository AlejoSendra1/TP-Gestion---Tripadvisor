package ar.uba.fi.gestion.trippy.publication.dto;

import ar.uba.fi.gestion.trippy.common.location.Location;
import java.util.List;

// DTO para US #24 (Publicar Restaurant)
// ahora con openingStart y openingEnd (String, por ejemplo "09:00")
public record RestaurantCreateDTO(
        // Campos comunes
        String title,
        String description,
        double price,
        Location location,
        String mainImageUrl,
        List<String> imageUrls,

        // Campos específicos de Restaurant
        String cuisineType,
        String priceRange, // Ej: "$$ - $$$"
        String openingStart,
        String openingEnd,
        String menuUrl
) {}