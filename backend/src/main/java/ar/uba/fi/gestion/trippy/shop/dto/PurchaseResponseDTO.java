package ar.uba.fi.gestion.trippy.shop.dto;

public class PurchaseResponseDTO {
    private Boolean success;
    private String message;
    private UserBenefitDTO userBenefit;
    private Integer remainingXp;

    public PurchaseResponseDTO() {}

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UserBenefitDTO getUserBenefit() { return userBenefit; }
    public void setUserBenefit(UserBenefitDTO userBenefit) { this.userBenefit = userBenefit; }

    public Integer getRemainingXp() { return remainingXp; }
    public void setRemainingXp(Integer remainingXp) { this.remainingXp = remainingXp; }
}