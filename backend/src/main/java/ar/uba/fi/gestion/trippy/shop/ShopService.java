package ar.uba.fi.gestion.trippy.shop;

import ar.uba.fi.gestion.trippy.shop.dto.BenefitDTO;
import ar.uba.fi.gestion.trippy.shop.dto.PurchaseResponseDTO;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShopService {

    private final BenefitRepository benefitRepository;
    private final UserBenefitRepository userBenefitRepository;
    private final UserRepository userRepository;

    @Autowired
    public ShopService(BenefitRepository benefitRepository,
                       UserBenefitRepository userBenefitRepository,
                       UserRepository userRepository) {
        this.benefitRepository = benefitRepository;
        this.userBenefitRepository = userBenefitRepository;
        this.userRepository = userRepository;
    }

    /**
     * Obtiene todos los beneficios disponibles en la tienda
     */
    @Transactional(readOnly = true)
    public List<BenefitDTO> getAllBenefits() {
        return benefitRepository.findAll()
                .stream()
                .map(BenefitDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Procesa la compra de un beneficio
     */
    @Transactional
    public PurchaseResponseDTO purchaseBenefit(Long benefitId, String userEmail) {
        // Buscar el usuario
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!(user instanceof Traveler traveler)) {
            throw new IllegalStateException("Solo los viajeros pueden comprar beneficios");
        }

        // Buscar el beneficio
        Benefit benefit = benefitRepository.findById(benefitId)
                .orElseThrow(() -> new EntityNotFoundException("Beneficio no encontrado"));

        // ✅ CORREGIDO: Usar getUserXP() consistentemente
        int currentXp = traveler.getUserXP();
        
        // Verificar si tiene suficientes puntos
        if (currentXp < benefit.getCost()) {
            throw new IllegalStateException(
                String.format("XP insuficiente. Necesitas %d XP pero solo tienes %d XP", 
                    benefit.getCost(), currentXp)
            );
        }

        // ✅ CORREGIDO: Usar subtractXp para mantener consistencia
        traveler.subtractXp(benefit.getCost());
        userRepository.save(traveler);

        // Crear el registro de beneficio del usuario
        UserBenefit userBenefit = new UserBenefit();
        userBenefit.setUser(traveler);
        userBenefit.setBenefit(benefit);
        userBenefit.setUsed(false);
        userBenefit = userBenefitRepository.save(userBenefit);

        // Construir respuesta
        PurchaseResponseDTO response = new PurchaseResponseDTO();
        response.setSuccess(true);
        response.setMessage("¡Beneficio adquirido exitosamente!");
        response.setRemainingXp(traveler.getUserXP());

        System.out.println("✅ " + traveler.getEmail() + " compró: " + benefit.getName() + 
                         " por " + benefit.getCost() + " XP. XP restante: " + traveler.getUserXP());

        return response;
    }

    /**
     * Obtiene todos los beneficios que ha comprado un usuario
     */
    @Transactional(readOnly = true)
    public List<UserBenefit> getUserBenefits(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return userBenefitRepository.findByUserId(user.getId());
    }

    /**
     * Obtiene los beneficios activos (no usados) de un usuario
     */
    @Transactional(readOnly = true)
    public List<UserBenefit> getActiveBenefits(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return userBenefitRepository.findByUserIdAndUsedFalse(user.getId());
    }

    /**
     * Obtiene beneficios activos de un tipo específico para un usuario
     */
    @Transactional(readOnly = true)
    public List<UserBenefit> getActiveBenefitsByType(Long userId, Benefit.BenefitType type) {
        return userBenefitRepository.findActiveByUserIdAndType(userId, type);
    }
    
    /**
     * ✅ NUEVO: Marca un beneficio como usado
     */
    @Transactional
    public void markBenefitAsUsed(Long userBenefitId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        UserBenefit userBenefit = userBenefitRepository.findById(userBenefitId)
                .orElseThrow(() -> new EntityNotFoundException("Beneficio no encontrado"));

        // Verificar que el beneficio pertenece al usuario
        if (!userBenefit.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("No puedes usar un beneficio que no te pertenece");
        }

        // Verificar que no ha sido usado
        if (userBenefit.getUsed()) {
            throw new IllegalStateException("Este beneficio ya ha sido usado");
        }

        userBenefit.markAsUsed();
        userBenefitRepository.save(userBenefit);
        
        System.out.println("✅ Beneficio marcado como usado: " + userBenefit.getBenefit().getName());
    }
}