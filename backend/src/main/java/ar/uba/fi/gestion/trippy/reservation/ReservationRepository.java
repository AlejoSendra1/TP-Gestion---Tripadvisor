// language: java
package ar.uba.fi.gestion.trippy.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByPublicationId(Long publicationId);
    List<Reservation> findByTravelerId(Long travelerId);

    @Query("""
        select r from Reservation r
        where r.publication.id = :publicationId
          and r.startDate <= :end
          and coalesce(r.endDate, r.startDate) >= :start
        """)
    List<Reservation> findOverlappingReservations(
            @Param("publicationId") Long publicationId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
