package ar.uba.fi.gestion.trippy.shop.dto;

import ar.uba.fi.gestion.trippy.shop.Benefit;

public class BenefitDTO {
    private Long id;
    private String name;
    private String description;
    private Integer cost;
    private Benefit.BenefitType type;
    private Integer discountPercentage;
    private Integer xpBonus;
    private Boolean singleUse;

    // Constructor vacío
    public BenefitDTO() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCost() { return cost; }
    public void setCost(Integer cost) { this.cost = cost; }

    public Benefit.BenefitType getType() { return type; }
    public void setType(Benefit.BenefitType type) { this.type = type; }

    public Integer getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Integer discountPercentage) { this.discountPercentage = discountPercentage; }

    public Integer getXpBonus() { return xpBonus; }
    public void setXpBonus(Integer xpBonus) { this.xpBonus = xpBonus; }

    public Boolean getSingleUse() { return singleUse; }
    public void setSingleUse(Boolean singleUse) { this.singleUse = singleUse; }

    // Método estático para crear desde entidad
    public static BenefitDTO fromEntity(Benefit benefit) {
        BenefitDTO dto = new BenefitDTO();
        dto.setId(benefit.getId());
        dto.setName(benefit.getName());
        dto.setDescription(benefit.getDescription());
        dto.setCost(benefit.getCost());
        dto.setType(benefit.getType());
        dto.setDiscountPercentage(benefit.getDiscountPercentage());
        dto.setXpBonus(benefit.getXpBonus());
        dto.setSingleUse(benefit.getSingleUse());
        return dto;
    }
}