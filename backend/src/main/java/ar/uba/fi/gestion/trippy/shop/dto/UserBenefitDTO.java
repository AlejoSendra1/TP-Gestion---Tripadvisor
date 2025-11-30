package ar.uba.fi.gestion.trippy.shop.dto;

import java.time.LocalDateTime;

public class UserBenefitDTO {
    private Long id;
    private BenefitDTO benefit;
    private LocalDateTime purchaseDate;
    private Boolean used;
    private LocalDateTime usedDate;

    public UserBenefitDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BenefitDTO getBenefit() { return benefit; }
    public void setBenefit(BenefitDTO benefit) { this.benefit = benefit; }

    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDateTime purchaseDate) { this.purchaseDate = purchaseDate; }

    public Boolean getUsed() { return used; }
    public void setUsed(Boolean used) { this.used = used; }

    public LocalDateTime getUsedDate() { return usedDate; }
    public void setUsedDate(LocalDateTime usedDate) { this.usedDate = usedDate; }
}