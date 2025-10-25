package ar.uba.fi.gestion.trippy.publication.dto;

import ar.uba.fi.gestion.trippy.common.location.Location;
import java.util.List;

// DTO para US #25 (Publicar Co-working)
public record CoworkingCreateDTO(
        // Campos comunes
        String title,
        String description,
        double price, // Precio base (quizás por hora o default)
        Location location,
        String mainImageUrl,
        List<String> imageUrls,

        // Campos específicos de Coworking
        double pricePerDay,
        double pricePerMonth,
        List<String> services
) {}