package ar.uba.fi.gestion.trippy.user.dto;

import java.math.BigDecimal;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationIncomeDTO;

public class HostStatsDTO {
    private Double averageRating;
    private BigDecimal totalIncome;
    private PublicationIncomeDTO topPublication;

    public HostStatsDTO() {}

    public HostStatsDTO(Double averageRating, BigDecimal totalIncome, PublicationIncomeDTO topPublication) {
        this.averageRating = averageRating;
        this.totalIncome = totalIncome;
        this.topPublication = topPublication;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public PublicationIncomeDTO getTopPublication() {
        return topPublication;
    }

    public void setTopPublication(PublicationIncomeDTO topPublication) {
        this.topPublication = topPublication;
    }
}