package ar.uba.fi.gestion.trippy.publication;

import java.math.BigDecimal;

public record FiltersSpec(
    String query,
    String category,
    String location,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    BigDecimal minRating,
    String sortBy,      // "price", "title", "rating"
    String sortOrder    // "asc", "desc"
) {
    public FiltersSpec {
        // Constructor compacto para validaciones iniciales
        if (sortBy == null) sortBy = "title";
        if (sortOrder == null) sortOrder = "desc";
    }
}