package ar.uba.fi.gestion.trippy.user;

public record BusinessOwnerDTO(
        TokenDTO tokenDTO,
        String email,
        String businessName,
        String businessType,
        Boolean verified,
        String userType
) implements UserDTO {}