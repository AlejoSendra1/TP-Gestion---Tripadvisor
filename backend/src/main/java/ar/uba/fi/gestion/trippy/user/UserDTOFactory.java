package ar.uba.fi.gestion.trippy.user;

public class UserDTOFactory {

    public static UserDTO fromUser(User user, TokenDTO tokenDTO) {
        return switch (user) {
            case Traveler traveler -> new TravelerDTO(
                    tokenDTO,
                    traveler.getEmail(),
                    traveler.getFirstname(),
                    traveler.getLastname(),
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
