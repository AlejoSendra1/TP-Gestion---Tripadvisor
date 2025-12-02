package ar.uba.fi.gestion.trippy.user.dto;

public record BusinessOwnerDTO(
        TokenDTO tokenDTO,
        String email,
        String businessName,
        Boolean verified,
        String userType,
        String role,
        String photo
) implements UserDTO {}