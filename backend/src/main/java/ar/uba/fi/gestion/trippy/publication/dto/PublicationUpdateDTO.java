package ar.uba.fi.gestion.trippy.publication.dto;

import ar.uba.fi.gestion.trippy.common.location.Location;
import java.util.List;

public record PublicationUpdateDTO(
    String title,
    String description,
    Double price,
    Location location,
    String mainImageUrl,
    List<String> imageUrls
) {}