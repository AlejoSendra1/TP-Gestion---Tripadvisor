package ar.uba.fi.gestion.trippy.user.gamification;

import java.util.List;
import java.util.Optional;

/**
 * Sistema de niveles y experiencia para gamificación
 */
public class LevelSystem {

    private static final List<LevelConfig> LEVELS = List.of(
            new LevelConfig(1, 0, "Explorador Novato", List.of("Badge de Bienvenida")),
            new LevelConfig(2, 500, "Viajero Entusiasta", List.of("Badge de Viajero", "Avatar personalizado")),
            new LevelConfig(3, 1500, "Aventurero Experimentado", List.of("5% descuento en reservas", "Badge de Aventurero")),
            new LevelConfig(4, 3000, "Trotamundos Experto", List.of("8% descuento en reservas", "Acceso a ofertas flash")),
            new LevelConfig(5, 5000, "Maestro Viajero", List.of("10% descuento en reservas", "Ofertas exclusivas", "Badge de Maestro")),
            new LevelConfig(6, 8000, "Leyenda del Turismo", List.of("12% descuento en reservas", "Cancelación flexible gratuita")),
            new LevelConfig(7, 12000, "Elite Global", List.of("15% descuento en reservas", "Prioridad en atención al cliente", "Badge Elite")),
            new LevelConfig(8, 17000, "Icono de Aventuras", List.of("18% descuento en reservas", "Upgrades gratuitos cuando disponible")),
            new LevelConfig(9, 23000, "Gurú de Viajes", List.of("20% descuento en reservas", "Acceso VIP a eventos", "Badge de Gurú")),
            new LevelConfig(10, 30000, "Explorador Legendario", List.of("25% descuento en reservas", "Experiencias VIP gratuitas", "Badge Legendario", "Soporte VIP 24/7"))
    );

    /**
     * Calcula el nivel basado en el XP actual
     */
    public static int calculateLevel(int currentXP) {
        for (int i = LEVELS.size() - 1; i >= 0; i--) {
            if (currentXP >= LEVELS.get(i).requiredXP()) {
                return LEVELS.get(i).level();
            }
        }
        return 1;
    }

    /**
     * Obtiene la configuración de un nivel específico
     */
    public static Optional<LevelConfig> getLevelConfig(int level) {
        return LEVELS.stream()
                .filter(config -> config.level() == level)
                .findFirst();
    }

    /**
     * Obtiene el XP requerido para el siguiente nivel
     */
    public static int getNextLevelXP(int currentLevel) {
        if (currentLevel >= LEVELS.size()) {
            return LEVELS.get(LEVELS.size() - 1).requiredXP();
        }
        return LEVELS.get(currentLevel).requiredXP();
    }

    /**
     * Calcula el XP restante para el siguiente nivel
     */
    public static int getXPToNextLevel(int currentXP, int currentLevel) {
        int nextLevelXP = getNextLevelXP(currentLevel);
        return Math.max(0, nextLevelXP - currentXP);
    }

    /**
     * Obtiene el porcentaje de progreso hacia el siguiente nivel
     */
    public static double getProgressPercentage(int currentXP, int currentLevel) {
        if (currentLevel >= LEVELS.size()) {
            return 100.0;
        }
        
        int currentLevelXP = LEVELS.get(currentLevel - 1).requiredXP();
        int nextLevelXP = getNextLevelXP(currentLevel);
        int xpInCurrentLevel = currentXP - currentLevelXP;
        int xpNeededForLevel = nextLevelXP - currentLevelXP;
        
        return (double) xpInCurrentLevel / xpNeededForLevel * 100.0;
    }

    /**
     * Obtiene todos los niveles disponibles
     */
    public static List<LevelConfig> getAllLevels() {
        return LEVELS;
    }

    /**
     * Calcula el porcentaje de descuento basado en el nivel
     */
    public static int getDiscountPercentage(int level) {
        return switch (level) {
            case 1, 2 -> 0;
            case 3 -> 5;
            case 4 -> 8;
            case 5 -> 10;
            case 6 -> 12;
            case 7 -> 15;
            case 8 -> 18;
            case 9 -> 20;
            case 10 -> 25;
            default -> 0;
        };
    }

    /**
     * Configuración de un nivel
     */
    public record LevelConfig(
            int level,
            int requiredXP,
            String name,
            List<String> benefits
    ) {}
}