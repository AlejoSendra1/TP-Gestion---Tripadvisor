package ar.uba.fi.gestion.trippy.publication.dto;

import java.math.BigDecimal;

public class PublicationIncomeDTO {
    private Long publicationId;
    private String title;
    private BigDecimal income;

    public PublicationIncomeDTO() {}

    public PublicationIncomeDTO(Long publicationId, String title, BigDecimal income) {
        this.publicationId = publicationId;
        this.title = title;
        this.income = income;
    }

    public Long getPublicationId() {
        return publicationId;
    }

    public void setPublicationId(Long publicationId) {
        this.publicationId = publicationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }
}
