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
    
    @Query(value = """
        SELECT p.* FROM publication p 
        WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) 
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:category IS NULL OR p.tipo_publicacion = :category)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:location IS NULL OR 
           LOWER(p.city) LIKE LOWER(CONCAT('%', :location, '%')) OR
           LOWER(p.country) LIKE LOWER(CONCAT('%', :location, '%')) OR
           LOWER(p.state) LIKE LOWER(CONCAT('%', :location, '%')))
        ORDER BY p.title DESC
        """, nativeQuery = true)
    List<Publication> searchPublications(
        @Param("query") String query,
        @Param("category") String category,
        @Param("location") String location,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );
}