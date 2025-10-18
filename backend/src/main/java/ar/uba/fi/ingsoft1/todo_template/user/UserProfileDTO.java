package ar.uba.fi.ingsoft1.todo_template.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record UserProfileDTO(
        Long id,
        String name,
        String lastname,
        String email,
        @Schema(description = "Edad del usuario", maxLength = 255, example = "23")
        @Positive
        Short age,
        String gender,
        List<UserZones> zones,
        String photo
) {

    public static UserProfileDTO fromUser(User user) {
        List<String> collectedZoneNames = user.getZones()
                .stream()
                .map(UserZones::name)
                .toList();

        UserProfileDTO userProfileDTO = new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getLastname(),
                user.getEmail(),
                user.getAge(),
                user.getGender(),
                user.getZones(),
                user.getPhoto()
                ); return userProfileDTO;
    }
}
