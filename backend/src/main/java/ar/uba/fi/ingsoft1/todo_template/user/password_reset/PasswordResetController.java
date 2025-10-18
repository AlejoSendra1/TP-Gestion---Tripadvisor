package ar.uba.fi.ingsoft1.todo_template.user.password_reset;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@Tag(name = "Password Reset",description = "Endpoints for reset users password")
@RequestMapping("/password_reset")

public class PasswordResetController {
    private final PasswordResetService passwordResetService;
    private final PasswordChangeService passwordChangeService;
    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    public PasswordResetController(PasswordResetService passwordResetService, PasswordChangeService passwordChangeService) {
        this.passwordResetService = passwordResetService;
        this.passwordChangeService = passwordChangeService;
    }
    @PostMapping("/request-reset")
    public ResponseEntity<String> requestParam (@RequestParam("email") String email) {
        try {
            passwordResetService.requestPasswordReset(email);
            return ResponseEntity.ok("Email reset sent");
        }catch (UsernameNotFoundException e) {
            logger.warn("Usario no encontrado:{}", email);
            return ResponseEntity.badRequest().body("Email no encontrado. Por favor registrese");
        }catch (Exception ex) {
            logger.warn("Error al enviar el email {}:{}", email, ex.getMessage(),ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ha ocurrido un error inesperado al procesar la solicitud");
        }
    }

    @PostMapping("/new-password")
    public ResponseEntity<String> resetParam (@RequestParam("token") String token, @RequestParam String newPassword) {
        try{
            logger.info("Hola");
        passwordChangeService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password update successful");
        } catch (UsernameNotFoundException e) {
        logger.warn("Intento de cambio de clave con token inválido/expirado:{}",e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception ex) {
        logger.error("Error inesperado al restablecer clave con token: {}", ex.getMessage(),ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ha ocurrido un error inesperado al restablecer la clave ");
        }
    }

}
