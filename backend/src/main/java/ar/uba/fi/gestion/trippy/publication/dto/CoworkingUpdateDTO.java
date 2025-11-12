package ar.uba.fi.gestion.trippy.publication.dto;

import java.util.List;

public record CoworkingUpdateDTO(
    Double pricePerDay,
    Double pricePerMonth,
    Integer capacity, // <-- nuevo
    List<String> services
) {}
