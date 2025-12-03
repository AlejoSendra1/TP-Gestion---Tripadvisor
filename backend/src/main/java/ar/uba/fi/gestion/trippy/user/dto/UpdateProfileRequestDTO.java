package ar.uba.fi.gestion.trippy.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequestDTO(
        @NotBlank(message = "El nombre no puede estar vacío")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "El apellido no puede estar vacío")
        @Size(max = 100)
        String lastName,
        String photo
) {
}