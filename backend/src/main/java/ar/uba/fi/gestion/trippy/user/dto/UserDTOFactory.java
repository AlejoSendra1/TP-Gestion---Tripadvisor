package ar.uba.fi.gestion.trippy.user.dto;

import ar.uba.fi.gestion.trippy.user.BusinessOwner;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.User;

public class UserDTOFactory {

    public static UserDTO fromUser(User user, TokenDTO tokenDTO) {
        return switch (user) {
            case Traveler traveler -> new TravelerDTO(
                    tokenDTO,
                    traveler.getEmail(),
                    traveler.getFirstName(),
                    traveler.getLastName(),
                    traveler.getXp(),
                    traveler.getLevel(),
                    traveler.getUserType()
            );
            case BusinessOwner owner -> new BusinessOwnerDTO(
                    tokenDTO,
                    owner.getEmail(),
                    owner.getBusinessName(),
                    owner.getBusinessType(),
                    owner.getVerified(),
                    owner.getUserType()
            );
            default -> throw new IllegalArgumentException("Unknown user type: " + user.getClass());
        };
    }
}
