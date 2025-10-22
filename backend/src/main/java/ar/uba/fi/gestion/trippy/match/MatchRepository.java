package ar.uba.fi.gestion.trippy.match;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query(value = "SELECT * FROM match p JOIN participation_type pt ON p.participation_type_id = pt.part_type_id WHERE pt.type = 'Open'", nativeQuery = true)
    Page<Match> findAllWithOpenParticipation(Pageable pageable);


    @Query("SELECT m FROM Match m JOIN m.reservation r WHERE r.organizer.email = :email")
    Page<Match> findAllMatchesOrganizedByActualUser(Pageable pageable, @Param("email") String email);

    @Query(value = """
    SELECT * FROM match m
    JOIN participation_type pt ON m.participation_type_id = pt.part_type_id
    JOIN open_players op ON pt.part_type_id = op.open_id
    WHERE pt.type = 'Open' AND op.user_id = :userId
    """, nativeQuery = true)
    Page<Match> findAllOpenMatchesTheUserIsIn(Pageable pageable, @Param("userId") Long userId);

    @Query("""
       SELECT m FROM Match m
       WHERE TYPE(m.participationType) = Close
         AND (
            :email IN (SELECT p FROM Close c JOIN c.teama.players p WHERE c = m.participationType)
            OR
            :email IN (SELECT p FROM Close c JOIN c.teamb.players p WHERE c = m.participationType)
         )
       """)
    Page<Match> findAllCloseMatchesTheUserIsIn(Pageable pageable, @Param("email") String email);


}
