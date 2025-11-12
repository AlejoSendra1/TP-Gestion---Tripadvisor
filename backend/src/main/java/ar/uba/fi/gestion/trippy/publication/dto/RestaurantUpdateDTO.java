package ar.uba.fi.gestion.trippy.publication.dto;

public record RestaurantUpdateDTO(
    String cuisineType,
    String priceRange,
    String openingStart,
    String openingEnd,
    String menuUrl,
    Integer capacity // permitir actualizar capacity
) {}
