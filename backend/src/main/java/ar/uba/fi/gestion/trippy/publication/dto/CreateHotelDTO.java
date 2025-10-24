package ar.uba.fi.gestion.trippy.publication.dto;

import ar.uba.fi.gestion.trippy.common.location.Location;
import java.util.List;

// Usamos un 'record' para el DTO de entrada.
// Nota que no pedimos el 'hostId', ¡lo sacaremos del token!
public record CreateHotelDTO(
        String title,
        String description,
        double price,
        Location location,
        String mainImageUrl,
        List<String> imageUrls,

        // Campos específicos de Hotel
        int roomCount,
        int capacity
) {}