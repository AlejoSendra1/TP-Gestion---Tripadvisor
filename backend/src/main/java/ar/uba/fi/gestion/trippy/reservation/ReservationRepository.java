// java
package ar.uba.fi.gestion.trippy.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByPublicationId(Long publicationId);
    List<Reservation> findByTravelerId(Long travelerId);

    @Query("""
        SELECT COALESCE(SUM(r.roomCount), 0)
        FROM ReservationHotel r
        WHERE r.publication.id = :pubId
          AND r.status = :status
          AND r.checkOut >= :start
          AND r.checkIn <= :end
    """)
    Long sumBookedRoomsForPublicationBetween(
            @Param("pubId") Long publicationId,
            @Param("status") ReservationStatus status,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("""
        SELECT COALESCE(SUM(r.participantCount), 0)
        FROM ReservationActivity r
        WHERE r.publication.id = :pubId
          AND r.status = :status
          AND r.startDateTime >= :start
          AND r.startDateTime < :end
    """)
    Long sumParticipantsForPublicationBetween(
            @Param("pubId") Long publicationId,
            @Param("status") ReservationStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
