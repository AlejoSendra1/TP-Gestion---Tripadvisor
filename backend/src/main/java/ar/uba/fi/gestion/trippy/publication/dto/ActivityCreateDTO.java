package ar.uba.fi.gestion.trippy.publication.dto;

import ar.uba.fi.gestion.trippy.common.location.Location;
import java.util.List;

// DTO para US #26 (Publicar Experiencia)
public record ActivityCreateDTO(
        // Campos comunes
        String title,
        String description,
        double price,
        Location location,
        String mainImageUrl,
        List<String> imageUrls,

        // Campos específicos de Activity
        int durationInHours,
        String meetingPoint,
        String whatIsIncluded,
        String activityLevel,
        String language
) {}