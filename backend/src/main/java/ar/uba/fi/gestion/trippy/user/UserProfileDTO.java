package ar.uba.fi.gestion.trippy.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record UserProfileDTO(
        Long id,
        String name,
        String lastname,
        String email
) {

    public static UserProfileDTO fromUser(User user) {

        UserProfileDTO userProfileDTO = new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getLastname(),
                user.getEmail()
                ); return userProfileDTO;
    }
}
