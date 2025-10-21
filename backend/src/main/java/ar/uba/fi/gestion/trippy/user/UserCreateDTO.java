package ar.uba.fi.gestion.trippy.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.function.Function;

public record UserCreateDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 255)
        @Schema(description = "El nombre es obligatorio", maxLength = 255, example = "Juan", required = true)
        String name,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 255)
        @Schema(description = "El apellido es obligatorio", maxLength = 255, example = "Pérez", required = true)
        String lastname,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "Formato de correo electrónico inválido")
        @Size(max = 255)
        @Schema(description = "El correo electrónico es obligatorio y debe ser válido", maxLength = 255, example = "juan@ejemplo.com", required = true)
        String email,

        @NotNull(message = "Debe especificar al menos una zona")
        @NotEmpty(message = "Debe especificar al menos una zona")
        List<UserZones> zones,

        @NotBlank(message = "Contraseña es obligatoria")
        @Schema(description = "Contraseña es obligatoria", required = true, example = "ejemplo123")
        String password,

        @Schema(description = "URL de la foto", example = "http://example.com/photo.jpg")
        String photo,

        @NotBlank(message = "Género es obligatorio")
        @Schema(description = "Género del usuario", example = "hombre")
        String gender,

        @NotNull(message = "Age is required")
        @Min(value = 14, message = "La edad debe ser un número positivo y válido")
        @Max(value = 150, message = "La edad debe ser un número válido")
        @Schema(description = "Edad del usuario", example = "18")
        Short age



) implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(name, lastname, email, encryptPassword.apply(password));
    }
}
