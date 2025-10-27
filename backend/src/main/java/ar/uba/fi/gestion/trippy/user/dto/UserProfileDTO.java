package ar.uba.fi.gestion.trippy.user.dto;

public record UserProfileDTO(
        Long id,
        String name,
        String lastname,
        String email,
        String photo
) {

    /*
    public static UserProfileDTO fromUser(User user) {

        UserProfileDTO userProfileDTO = new UserProfileDTO(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getPhoto()
                ); return userProfileDTO;
    }

     */
}
