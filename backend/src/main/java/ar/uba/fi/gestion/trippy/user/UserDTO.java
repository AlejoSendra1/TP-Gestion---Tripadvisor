package ar.uba.fi.gestion.trippy.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserDTO (
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 255)
        @Schema(description = "El nombre es obligatorio", maxLength = 255, example = "Juan", required = true)
        String firstName,

        int userXP,

        int userLevel,

        @NotBlank(message = "Token is needed for security")
        TokenDTO tokenDTO
) {}
