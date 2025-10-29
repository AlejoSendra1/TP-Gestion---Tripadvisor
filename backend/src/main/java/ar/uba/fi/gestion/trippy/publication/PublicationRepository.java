package ar.uba.fi.gestion.trippy.publication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    // ¡Y ya está!
    // findAll() te devolverá una List<Publication> con Alojamientos, Restaurantes, etc.
    // findById(id) funcionará perfecto.
    List<Publication> findByTitleContainingIgnoreCase(String title);
    
    @Query("SELECT e FROM Publication e WHERE " +
           "(:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR TYPE(e) = :category) AND " +
           "(:location IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minPrice IS NULL OR e.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR e.price <= :maxPrice) " +
           "ORDER BY e.title DESC")
    List<Publication> searchPublications(
        @Param("query") String query,
        @Param("category") String category,
        @Param("location") String location,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );
}