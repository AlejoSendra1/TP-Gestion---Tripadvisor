package ar.uba.fi.gestion.trippy.user.dto;

import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.User;

public record UserProfileDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        String photo,
        LevelInfoDTO levelInfo,
        Integer trippyCoins,
        Integer reviewsCount,
        Integer placesVisited,
        Integer photosShared,
        Integer helpfulVotes
) {

    public static UserProfileDTO fromUser(User user) {
        if (user instanceof Traveler traveler) {
            return new UserProfileDTO(
                user.getId(),
                traveler.getFirstName(),
                traveler.getLastName(),
                user.getEmail(),
                null, // photo - implementar cuando tengas el campo
                LevelInfoDTO.fromTraveler(traveler),
                ((Traveler) user).getTrippyCoins(),
                0, // reviewsCount - obtener de repositorio de reviews
                0, // placesVisited - obtener de repositorio
                0, // photosShared - obtener de repositorio
                0  // helpfulVotes - obtener de repositorio
            );
        }
        
        // Para usuarios que no son Travelers
        return new UserProfileDTO(
            user.getId(),
            "User",
            "",
            user.getEmail(),
            null,
            null,
            0,
            0,
            0,
            0,
            0
        );
    }
}