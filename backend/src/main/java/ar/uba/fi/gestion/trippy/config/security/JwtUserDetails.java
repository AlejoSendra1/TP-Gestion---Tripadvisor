package ar.uba.fi.gestion.trippy.config.security;

public record JwtUserDetails(
        Long userId,      // ✅ AÑADIDO
        String username,
        String role
) {}