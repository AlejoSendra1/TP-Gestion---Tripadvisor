package ar.uba.fi.gestion.trippy.shop;

import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShopService {

    @Autowired
    private BenefitRepository benefitRepository;

    @Autowired
    private UserBenefitRepository userBenefitRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtiene todos los beneficios disponibles
     */
    public List<Benefit> getAllBenefits() {
        return benefitRepository.findAll();
    }

    /**
     * Compra un beneficio para un usuario
     */
    @Transactional
    public PurchaseResponse purchaseBenefit(Long userId, Long benefitId) {
        // Validar que el beneficio existe
        Benefit benefit = benefitRepository.findById(benefitId)
                .orElseThrow(() -> new IllegalArgumentException("Beneficio no encontrado"));

        // Obtener el usuario y verificar que sea un Traveler
        Traveler traveler = (Traveler) userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Verificar que sea un traveler (por si acaso)
        if (!"TRAVELER".equals(traveler.getUserType())) {
            throw new IllegalArgumentException("Solo los viajeros pueden comprar beneficios");
        }

        // Verificar que el usuario tiene suficientes XP
        Integer currentXP = traveler.getXp() != null ? traveler.getXp() : 0;
        if (currentXP < benefit.getCost()) {
            throw new IllegalArgumentException("No tienes suficientes puntos XP");
        }

        // Descontar los XP usando el método de Traveler
        traveler.subtractXp(benefit.getCost());
        userRepository.save(traveler);

        // Crear el UserBenefit
        UserBenefit userBenefit = new UserBenefit();
        userBenefit.setId(userId);
        userBenefit.setBenefit(benefit);
        userBenefit.setPurchaseDate(LocalDateTime.now());
        userBenefit.setUsed(false);
        userBenefitRepository.save(userBenefit);

        return new PurchaseResponse(
                true,
                "¡Beneficio adquirido exitosamente!",
                userBenefit,
                traveler.getXp() // Usar getXp() de Traveler
        );
    }

    /**
     * Obtiene todos los beneficios de un usuario
     */
    public List<UserBenefit> getUserBenefits(Long userId) {
        return userBenefitRepository.findByUserId(userId);
    }

    /**
     * Obtiene los beneficios activos (no usados) de un usuario
     */
    public List<UserBenefit> getActiveBenefits(Long userId) {
        return userBenefitRepository.findByUserIdAndUsed(userId, false);
    }

    /**
     * Obtiene los beneficios activos de un usuario filtrados por tipo
     * Usado por ReservationService para aplicar descuentos automáticamente
     */
    public List<UserBenefit> getActiveBenefitsByType(Long userId, Benefit.BenefitType type) {
        return userBenefitRepository.findByUserIdAndUsed(userId, false)
                .stream()
                .filter(ub -> ub.getBenefit().getType() == type)
                .collect(Collectors.toList());
    }

    /**
     * Marca un beneficio como usado
     */
    @Transactional
    public void useBenefit(Long userId, Long userBenefitId) {
        UserBenefit userBenefit = userBenefitRepository.findById(userBenefitId)
                .orElseThrow(() -> new IllegalArgumentException("Beneficio no encontrado"));

        // Verificar que el beneficio pertenece al usuario
        if (!userBenefit.getId().equals(userId)) {
            throw new IllegalArgumentException("No tienes permiso para usar este beneficio");
        }

        // Verificar que no esté ya usado
        if (userBenefit.getUsed()) {
            throw new IllegalArgumentException("Este beneficio ya fue usado");
        }

        userBenefit.setUsed(true);
        userBenefit.setUsedDate(LocalDateTime.now());
        userBenefitRepository.save(userBenefit);
    }

    /**
     * Marca un beneficio como usado usando el ID como String
     * Usado por ReservationService cuando se aplica un descuento
     */
    @Transactional
    public void markBenefitAsUsed(Long userId, String userBenefitIdStr) {
        try {
            Long userBenefitId = Long.parseLong(userBenefitIdStr);
            useBenefit(userId, userBenefitId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ID de beneficio inválido: " + userBenefitIdStr);
        }
    }
}