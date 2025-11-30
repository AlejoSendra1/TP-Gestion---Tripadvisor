package ar.uba.fi.gestion.trippy.shop;

import ar.uba.fi.gestion.trippy.shop.dto.BenefitDTO;
import ar.uba.fi.gestion.trippy.shop.dto.PurchaseResponseDTO;
import ar.uba.fi.gestion.trippy.shop.dto.UserBenefitDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shop")
@CrossOrigin(origins = "*")
public class ShopController {

    private final ShopService shopService;

    @Autowired
    public ShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    /**
     * GET /api/shop/benefits
     * Obtiene todos los beneficios disponibles en la tienda
     */
    @GetMapping("/benefits")
    public ResponseEntity<List<BenefitDTO>> getAllBenefits() {
        List<BenefitDTO> benefits = shopService.getAllBenefits();
        return ResponseEntity.ok(benefits);
    }

    /**
     * POST /api/shop/purchase/{benefitId}
     * Compra un beneficio específico
     */
    @PostMapping("/purchase/{benefitId}")
    public ResponseEntity<?> purchaseBenefit(
            @PathVariable Long benefitId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Debes iniciar sesión para comprar beneficios"));
        }

        try {
            String userEmail = authentication.getName();
            PurchaseResponseDTO response = shopService.purchaseBenefit(benefitId, userEmail);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "message", "Error al procesar la compra"));
        }
    }

    /**
     * GET /api/shop/user-benefits
     * Obtiene todos los beneficios que el usuario ha comprado
     */
    @GetMapping("/user-benefits")
    public ResponseEntity<?> getUserBenefits(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Debes iniciar sesión"));
        }

        try {
            String userEmail = authentication.getName();
            List<UserBenefit> benefits = shopService.getUserBenefits(userEmail);
            
            // ✅ Convertir a DTO para evitar lazy loading
            List<UserBenefitDTO> dtoList = benefits.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error al obtener beneficios"));
        }
    }

    /**
     * GET /api/shop/user-benefits/active
     * Obtiene los beneficios activos (no usados) del usuario
     */
    @GetMapping("/user-benefits/active")
    public ResponseEntity<?> getActiveBenefits(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Debes iniciar sesión"));
        }

        try {
            String userEmail = authentication.getName();
            List<UserBenefit> benefits = shopService.getActiveBenefits(userEmail);
            
            // ✅ Convertir a DTO
            List<UserBenefitDTO> dtoList = benefits.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error al obtener beneficios activos"));
        }
    }

    /**
     * ✅ NUEVO: POST /api/shop/user-benefits/{userBenefitId}/use
     * Marca un beneficio como usado manualmente
     */
    @PostMapping("/user-benefits/{userBenefitId}/use")
    public ResponseEntity<?> useBenefit(
            @PathVariable Long userBenefitId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Debes iniciar sesión"));
        }

        try {
            String userEmail = authentication.getName();
            shopService.markBenefitAsUsed(userBenefitId, userEmail);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Beneficio usado exitosamente"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "message", "Error al usar el beneficio"));
        }
    }

    /**
     * ✅ Helper method para convertir UserBenefit a DTO
     */
    private UserBenefitDTO convertToDTO(UserBenefit userBenefit) {
        UserBenefitDTO dto = new UserBenefitDTO();
        dto.setId(userBenefit.getId());
        dto.setPurchaseDate(userBenefit.getPurchaseDate());
        dto.setUsed(userBenefit.getUsed());
        dto.setUsedDate(userBenefit.getUsedDate());
        dto.setBenefit(BenefitDTO.fromEntity(userBenefit.getBenefit()));
        return dto;
    }
}