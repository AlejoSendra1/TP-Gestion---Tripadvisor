package ar.uba.fi.gestion.trippy.shop;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shop")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:30003", "https://trippy-hazel.vercel.app"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true"
)
public class ShopController {

    @Autowired
    private ShopService shopService;

    /**
     * Obtiene todos los beneficios disponibles en la tienda
     * Endpoint público - no requiere autenticación
     */
    @GetMapping("/benefits")
    public ResponseEntity<List<Benefit>> getAllBenefits() {
        try {
            List<Benefit> benefits = shopService.getAllBenefits();
            benefits.sort((o1, o2)
                    -> o1.getCost().compareTo(
                    o2.getCost()));
            System.out.println("✅ Returning " + benefits.size() + " benefits");
            return ResponseEntity.ok(benefits);
        } catch (Exception e) {
            System.err.println("❌ Error getting benefits: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Compra un beneficio - REQUIERE AUTENTICACIÓN
     */
    @PostMapping("/purchase/{benefitId}")
    public ResponseEntity<PurchaseResponse> purchaseBenefit(
            @PathVariable Long benefitId
    ){
        PurchaseResponse response = shopService.purchaseBenefit(benefitId);
        return ResponseEntity.ok(response);
        /*
        try {
            PurchaseResponse response = shopService.purchaseBenefit(benefitId);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ Invalid purchase: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(new PurchaseResponse(false, e.getMessage(), null, 0));
        } catch (Exception e) {
            System.err.println("❌ Error purchasing benefit: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new PurchaseResponse(false, "Error interno del servidor", null, 0));
        }
        */
    }

    /**
     * Obtiene todos los beneficios que el usuario ha comprado
     * REQUIERE AUTENTICACIÓN
     */
    @GetMapping("/user-benefits")
    public ResponseEntity<List<UserBenefit>> getUserBenefits(
            @RequestAttribute("userId") Long userId) {
        
        try {
            System.out.println("👤 Getting benefits for user " + userId);
            List<UserBenefit> userBenefits = shopService.getUserBenefits(userId);
            return ResponseEntity.ok(userBenefits);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting user benefits: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtiene los beneficios activos (no usados) del usuario
     * REQUIERE AUTENTICACIÓN
     */
    @GetMapping("/user-benefits/active")
    public ResponseEntity<List<UserBenefit>> getActiveBenefits(
            @RequestAttribute("userId") Long userId) {
        
        try {
            System.out.println("⭐ Getting active benefits for user " + userId);
            List<UserBenefit> activeBenefits = shopService.getActiveBenefits(userId);
            return ResponseEntity.ok(activeBenefits);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting active benefits: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Marca un beneficio como usado manualmente
     * REQUIERE AUTENTICACIÓN
     */
    @PostMapping("/user-benefits/{userBenefitId}/use")
    public ResponseEntity<Map<String, Object>> useBenefit(
            @PathVariable Long userBenefitId,
            @RequestAttribute("userId") Long userId) {
        
        try {
            System.out.println("✓ User " + userId + " using benefit " + userBenefitId);
            shopService.useBenefit(userId, userBenefitId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Beneficio marcado como usado"
            ));
            
        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ Invalid operation: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (Exception e) {
            System.err.println("❌ Error using benefit: " + e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "success", false,
                    "message", "Error interno del servidor"
                ));
        }
    }
}