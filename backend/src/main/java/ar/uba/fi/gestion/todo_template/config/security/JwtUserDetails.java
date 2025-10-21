package ar.uba.fi.gestion.todo_template.config.security;

public record JwtUserDetails (
        String username,
        String role
) {}