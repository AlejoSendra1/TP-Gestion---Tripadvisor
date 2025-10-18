package ar.uba.fi.ingsoft1.todo_template.user.email_validation;

import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@Tag(name = "3 - Mail Validation",description = "Endpoints for the process of sending emails.")
@RequestMapping("/mail")
public class EmailRestController {
    @Autowired
    private EmailService emailService;
    private UserService userService;
    public EmailRestController(UserService userService, EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @PostMapping("/sendEmail")
    @Operation(
            summary = "Enviar correo electrónico",
            description = "Permite enviar un email a una dirección especificada, con un asunto y contenido definidos. " +
                    "Se usa para validar cuentas u otras notificaciones automáticas."
    )
    public void senEmail(@RequestParam String to, @RequestParam String subject, @RequestParam String body) {
        emailService.sendEmail(to, subject, body);
    }
    @GetMapping("/verify-email/{token}")
    @Operation(
            summary = "Validación de correo electrónico",
            description = "Verifica el token enviado al correo electrónico del usuario durante el registro. " +
                    "Si el token es válido, se activa la cuenta del usuario."
    )
    public ResponseEntity<String> validationEmail(@PathVariable String token) {
        boolean verified = userService.verifyEmailToken(token);
        if (verified){
            return ResponseEntity.ok("Verified email");
        }else{
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }
}



