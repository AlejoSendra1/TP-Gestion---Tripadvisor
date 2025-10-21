package ar.uba.fi.gestion.todo_template.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record UserProfileDTO(
        Long id,
        String name,
        String lastname,
        String email,
        String photo
) {

    public static UserProfileDTO fromUser(User user) {

        UserProfileDTO userProfileDTO = new UserProfileDTO(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getPhoto()
                ); return userProfileDTO;
    }
}
