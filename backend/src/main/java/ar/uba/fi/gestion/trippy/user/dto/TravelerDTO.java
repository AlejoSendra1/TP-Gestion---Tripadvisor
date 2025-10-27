package ar.uba.fi.gestion.trippy.user.dto;

public record TravelerDTO(
        TokenDTO tokenDTO,
        String email,
        String firstName,
        String lastName,
        Integer userXP,
        Integer userLevel,
        String userType
) implements UserDTO {}