package ar.uba.fi.gestion.trippy.publication.dto;

import java.util.List;

public record CoworkingUpdateDTO(
    Double pricePerDay,
    Double pricePerMonth,
    List<String> services
) {}
