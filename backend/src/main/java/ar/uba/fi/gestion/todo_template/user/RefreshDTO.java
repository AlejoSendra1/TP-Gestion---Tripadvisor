package ar.uba.fi.gestion.todo_template.user;

import jakarta.validation.constraints.NotBlank;

public record RefreshDTO(
        @NotBlank String refreshToken
) {}
