package ar.uba.fi.gestion.trippy.user;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "travelers")
@DiscriminatorValue("TRAVELER")
public class Traveler extends User {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private Integer xp = 0;

    @Column(nullable = false)
    private Integer level = 1;

    @Column
    private String achievements;

    @Column
    private String preferences;

    // Constantes para cálculo de niveles
    private static final int BASE_XP = 500;
    private static final double XP_MULTIPLIER = 1.5;

    public Traveler(){}

    public Traveler(String email, String password, String firstName, String lastName){
        super(email, password);
        this.setRole("USER");
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getFirstName() { 
        return this.firstName;
    }

    public String getLastName() { 
        return this.lastName;
    }

    public Integer getXp() { 
        return this.xp;
    }

    public void setXp(Integer xp) {
        this.xp = xp;
        updateLevel();
    }

    public void addXp(Integer xpToAdd) {
        this.xp += xpToAdd;
        updateLevel();
    }

    public Integer getLevel() { 
        return this.level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getUserType(){ 
        return "TRAVELER"; 
    }

    public Integer getUserXP() { 
        return this.xp; 
    }

    public Integer getUserLevel() { 
        return this.level; 
    }

    public String getAchievements() {
        return this.achievements;
    }

    public void setAchievements(String achievements) {
        this.achievements = achievements;
    }

    public String getPreferences() {
        return this.preferences;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }

    /**
     * Calcula el XP necesario para alcanzar un nivel específico
     */
    public static int calculateXpForLevel(int level) {
        if (level <= 1) return 0;
        int totalXp = 0;
        for (int i = 1; i < level; i++) {
            totalXp += (int) (BASE_XP * Math.pow(XP_MULTIPLIER, i - 1));
        }
        return totalXp;
    }

    /**
     * Calcula el XP necesario para el próximo nivel
     */
    public int getXpForNextLevel() {
        return calculateXpForLevel(this.level + 1);
    }

    /**
     * Calcula el XP necesario para pasar del nivel actual al siguiente
     */
    public int getXpRequiredForNextLevel() {
        return getXpForNextLevel() - calculateXpForLevel(this.level);
    }

    /**
     * Calcula el progreso actual dentro del nivel (0-100)
     */
    public double getLevelProgress() {
        int currentLevelXp = calculateXpForLevel(this.level);
        int nextLevelXp = getXpForNextLevel();
        int xpInCurrentLevel = this.xp - currentLevelXp;
        int xpNeededInLevel = nextLevelXp - currentLevelXp;
        
        if (xpNeededInLevel == 0) return 100.0;
        return (xpInCurrentLevel * 100.0) / xpNeededInLevel;
    }

    /**
     * Actualiza el nivel basado en el XP actual
     */
    private void updateLevel() {
        int newLevel = 1;
        while (this.xp >= calculateXpForLevel(newLevel + 1)) {
            newLevel++;
        }
        this.level = newLevel;
    }

    /**
     * Obtiene los beneficios del nivel actual
     */
    public String getLevelBenefits() {
        return switch (this.level) {
            case 1 -> "Acceso básico a la plataforma";
            case 2 -> "5% de descuento en reservas";
            case 3 -> "10% de descuento en reservas • Badge de Explorador";
            case 4 -> "10% de descuento • Prioridad en atención al cliente";
            case 5 -> "15% de descuento • Acceso a ofertas exclusivas";
            case 6 -> "15% de descuento • Acceso VIP a eventos";
            case 7 -> "20% de descuento • Upgrades gratuitos según disponibilidad";
            case 8 -> "20% de descuento • Check-in/out flexibles";
            case 9 -> "25% de descuento • Concierge personal";
            case 10 -> "30% de descuento • Acceso Elite • Todas las ventajas premium";
            default -> this.level > 10 ? 
                "30% de descuento • Acceso Elite • Beneficios exclusivos de nivel " + this.level :
                "Acceso básico a la plataforma";
        };
    }

    /**
     * Obtiene el porcentaje de descuento según el nivel
     */
    public int getDiscountPercentage() {
        return switch (this.level) {
            case 1 -> 0;
            case 2 -> 5;
            case 3, 4 -> 10;
            case 5, 6 -> 15;
            case 7, 8 -> 20;
            case 9 -> 25;
            default -> this.level >= 10 ? 30 : 0;
        };
    }
}