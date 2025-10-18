package ar.uba.fi.ingsoft1.todo_template.reservation;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByFieldId(Long fieldId);
    List<Reservation> findByFieldIdAndDate(Long fieldId, LocalDate date);
    List<Reservation> findByOrganizerEmail(String organizerEmail);
}
