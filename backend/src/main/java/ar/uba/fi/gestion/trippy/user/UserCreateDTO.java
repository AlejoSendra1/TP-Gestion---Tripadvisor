package ar.uba.fi.gestion.trippy.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.util.function.Function;

public record UserCreateDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 255)
        @Schema(description = "El nombre es obligatorio", maxLength = 255, example = "Juan", required = true)
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 255)
        @Schema(description = "El apellido es obligatorio", maxLength = 255, example = "Pérez", required = true)
        String lastName,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "Formato de correo electrónico inválido")
        @Size(max = 255)
        @Schema(description = "El correo electrónico es obligatorio y debe ser válido", maxLength = 255, example = "juan@ejemplo.com", required = true)
        String email,

        @NotBlank(message = "Contraseña es obligatoria")
        @Schema(description = "Contraseña es obligatoria", required = true, example = "ejemplo123")
        String password



) implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(firstName, lastName, email, encryptPassword.apply(password));
    }
}
