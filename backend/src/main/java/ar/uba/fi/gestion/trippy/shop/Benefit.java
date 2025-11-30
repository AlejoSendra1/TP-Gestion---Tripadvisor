package ar.uba.fi.gestion.trippy.shop;

import jakarta.persistence.*;

@Entity
@Table(name = "benefits")
public class Benefit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BenefitType type;

    private Integer discountPercentage;
    private Integer xpBonus;
    private Boolean singleUse = true;

    public enum BenefitType {
        DISCOUNT,
        XP_BONUS,
        PRIORITY_SUPPORT,
        FREE_UPGRADE
    }

    // Constructores
    public Benefit() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCost() { return cost; }
    public void setCost(Integer cost) { this.cost = cost; }

    public BenefitType getType() { return type; }
    public void setType(BenefitType type) { this.type = type; }

    public Integer getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Integer discountPercentage) { this.discountPercentage = discountPercentage; }

    public Integer getXpBonus() { return xpBonus; }
    public void setXpBonus(Integer xpBonus) { this.xpBonus = xpBonus; }

    public Boolean getSingleUse() { return singleUse; }
    public void setSingleUse(Boolean singleUse) { this.singleUse = singleUse; }
}