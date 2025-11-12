package ar.uba.fi.gestion.trippy.user.dto;

public record LevelInfoDTO(
    int currentLevel,
    int currentXp,
    int xpForNextLevel,
    int xpRequiredForNextLevel,
    double progressPercentage,
    String benefits,
    int discountPercentage
) {
    
    public static LevelInfoDTO fromTraveler(ar.uba.fi.gestion.trippy.user.Traveler traveler) {
        return new LevelInfoDTO(
            traveler.getLevel(),
            traveler.getXp(),
            traveler.getXpForNextLevel(),
            traveler.getXpRequiredForNextLevel(),
            traveler.getLevelProgress(),
            traveler.getLevelBenefits(),
            traveler.getDiscountPercentage()
        );
    }
}