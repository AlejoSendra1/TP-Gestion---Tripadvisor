package ar.uba.fi.gestion.trippy.publication.dto;

public record RestaurantUpdateDTO(
    String cuisineType,
    String priceRange,
    String openingHours,
    String menuUrl
) {}
