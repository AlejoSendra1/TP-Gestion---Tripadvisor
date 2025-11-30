package ar.uba.fi.gestion.trippy.shop;

import ar.uba.fi.gestion.trippy.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_benefits")
public class UserBenefit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "benefit_id", nullable = false)
    private Benefit benefit;

    @Column(nullable = false)
    private LocalDateTime purchaseDate;

    @Column(nullable = false)
    private Boolean used = false;

    private LocalDateTime usedDate;

    @PrePersist
    protected void onCreate() {
        purchaseDate = LocalDateTime.now();
    }

    // Constructor
    public UserBenefit() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Benefit getBenefit() { return benefit; }
    public void setBenefit(Benefit benefit) { this.benefit = benefit; }

    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDateTime purchaseDate) { this.purchaseDate = purchaseDate; }

    public Boolean getUsed() { return used; }
    public void setUsed(Boolean used) { this.used = used; }

    public LocalDateTime getUsedDate() { return usedDate; }
    public void setUsedDate(LocalDateTime usedDate) { this.usedDate = usedDate; }

    // Métodos de negocio
    public void markAsUsed() {
        this.used = true;
        this.usedDate = LocalDateTime.now();
    }

    public boolean isAvailable() {
        return !used;
    }
}