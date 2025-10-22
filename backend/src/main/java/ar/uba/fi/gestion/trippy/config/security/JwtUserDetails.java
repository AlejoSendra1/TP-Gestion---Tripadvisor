package ar.uba.fi.gestion.trippy.config.security;

public record JwtUserDetails (
        String username,
        String role
) {}