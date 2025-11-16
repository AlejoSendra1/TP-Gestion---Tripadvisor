// java
package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservation")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "reservation_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", nullable = false)
    private User traveler;

    @Column(name = "reservation_date", nullable = false)
    private LocalDateTime reservationDate;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    protected Reservation() { }

    public Reservation(Publication pub, User traveler, ReservationCreateDTO dto) {
        this.publication = pub;
        this.traveler = traveler;
        if (dto != null) {
            // Usar únicamente reservationDate si el cliente lo envía explícitamente.
            // NO copiar dto.dateTime() aquí (ese campo es la fecha solicitada para la reserva).
            if (dto.reservationDate() != null) {
                this.reservationDate = dto.reservationDate();
            }
            this.notes = dto.additionalInfo();
        }
    }

    @PrePersist
    private void prePersist() {
        if (this.reservationDate == null) {
            this.reservationDate = LocalDateTime.now();
        }
    }

    /**
     * Cada subclase debe implementar su validación de disponibilidad
     * antes de persistir la reserva. Puede lanzar IllegalStateException si no es válida.
     */
    public abstract void validateCapacity(ReservationRepository reservationRepository);

    public Long getId() { return id; }
    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }
    public User getTraveler() { return traveler; }
    public void setTraveler(User traveler) { this.traveler = traveler; }
    public LocalDateTime getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDateTime reservationDate) { this.reservationDate = reservationDate; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
