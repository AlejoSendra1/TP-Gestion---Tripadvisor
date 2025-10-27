package ar.uba.fi.gestion.trippy.user.dto;

public record BusinessOwnerDTO(
        TokenDTO tokenDTO,
        String email,
        String businessName,
        String businessType,
        Boolean verified,
        String userType
) implements UserDTO {}