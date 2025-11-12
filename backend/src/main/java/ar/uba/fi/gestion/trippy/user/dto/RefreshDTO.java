package ar.uba.fi.gestion.trippy.user.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshDTO(
        @NotBlank String refreshToken
) {}
