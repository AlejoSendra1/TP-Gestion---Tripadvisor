package ar.uba.fi.ingsoft1.todo_template.repository;

import ar.uba.fi.ingsoft1.todo_template.model.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    
    @Query("SELECT e FROM Experience e WHERE " +
           "(:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR e.category = :category) AND " +
           "(:location IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minPrice IS NULL OR e.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR e.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR e.rating >= :minRating) " +
           "ORDER BY e.rating DESC, e.reviews DESC")
    List<Experience> searchExperiences(
        @Param("query") String query,
        @Param("category") String category,
        @Param("location") String location,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minRating") BigDecimal minRating
    );
    
    @Query("SELECT DISTINCT e.location FROM Experience e ORDER BY e.location")
    List<String> findAllLocations();
    
    @Query("SELECT DISTINCT e.category FROM Experience e ORDER BY e.category")
    List<String> findAllCategories();
}
