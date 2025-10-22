package ar.uba.fi.gestion.trippy.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserLoginDTO (
        @NotBlank(message = "El email es obligatorio")
        @Size(max = 255)
        @Schema(maxLength = 255, example = "juan@ejemplo.com", required = true)
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(max = 255)
        @Schema(maxLength = 255, example = "ejemplo123", required = true)
        String password
) implements UserCredentials {}
