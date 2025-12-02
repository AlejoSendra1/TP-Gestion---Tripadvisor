package ar.uba.fi.gestion.trippy.shop;

public class PurchaseResponse {
    private Boolean success;
    private String message;
    private UserBenefit userBenefit;
    private Integer remainingTrippyCoins;

    // Constructor vacío
    public PurchaseResponse() {}

    // Constructor con todos los parámetros
    public PurchaseResponse(Boolean success, String message, UserBenefit userBenefit, Integer remainingTrippyCoins) {
        this.success = success;
        this.message = message;
        this.userBenefit = userBenefit;
        this.remainingTrippyCoins = remainingTrippyCoins;
    }

    // Getters y Setters
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public UserBenefit getUserBenefit() { return userBenefit; }
    public void setUserBenefit(UserBenefit userBenefit) { this.userBenefit = userBenefit; }
    
    public Integer getRemainingTrippyCoins() { return remainingTrippyCoins; }
    public void setRemainingTrippyCoins(Integer remainingTrippyCoins) { this.remainingTrippyCoins = remainingTrippyCoins; }
}