package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.common.exception.DuplicateEntityException;
import ar.uba.fi.gestion.trippy.config.security.JwtService;
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.user.dto.RegistrationRequestDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserLoginDTO;
import ar.uba.fi.gestion.trippy.user.dto.RefreshDTO;
import ar.uba.fi.gestion.trippy.user.dto.TokenDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserProfileDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserDTOFactory;
import ar.uba.fi.gestion.trippy.user.refresh_token.RefreshToken;
import ar.uba.fi.gestion.trippy.user.refresh_token.RefreshTokenService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ar.uba.fi.gestion.trippy.user.dto.UpdateProfileRequestDTO;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
    }

    public Optional<UserDTO> createUser(RegistrationRequestDTO data) {
        if (userRepository.findByEmail(data.email()).isPresent()) {
            throw new DuplicateEntityException("User", "email");
        }

        var user = data.asUser(passwordEncoder::encode);

        user.setRole(user.getRole());

        String verificationToken = UUID.randomUUID().toString();
        user.setTokenVerified(verificationToken);
        userRepository.save(user);
        // emailService.sendValidationEmail(user.getEmail(), verificationToken);
        TokenDTO tokens = Optional.of(generateTokens(user)).orElseThrow();

        return Optional.of(UserDTOFactory.fromUser(user, tokens));
    }

    public Optional<UserDTO> loginUser(UserLoginDTO data) {
        System.out.println("el login dto: " + data.toString());
        User maybeUser = userRepository.findByEmail(data.getEmail())
                .filter(user -> passwordEncoder.matches(data.getPassword(), user.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // Generate tokens for the user
        TokenDTO tokenDTO = generateTokens(maybeUser);
        return Optional.of(UserDTOFactory.fromUser(maybeUser, tokenDTO));
    }

    Optional<TokenDTO> refresh(RefreshDTO data) {
        return refreshTokenService.findByValue(data.refreshToken())
                .map(RefreshToken::user)
                .map(this::generateTokens);
    }

    private TokenDTO generateTokens(User user) {
        String accessToken = jwtService.createToken(new JwtUserDetails(
                user.getEmail(),
                user.getRole()));
        RefreshToken refreshToken = refreshTokenService.createFor(user);
        return new TokenDTO(accessToken, refreshToken.value());
    }

    public boolean verifyEmailToken(String token) {
        return userRepository.findByTokenVerified(token).map(user -> {
            // user.setEmailVerified(true);
            user.setTokenVerified(null);
            userRepository.save(user);
            return true;
        }).orElse(false);
    }

    public User getUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new EntityNotFoundException("User does not exist");
        }
        return user.get();
    }

    public String getCurrentUserName() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        User currentUser = getUserByEmail(userDetails.username());
        
        if (currentUser instanceof Traveler traveler) {
            return traveler.getFirstName() + " " + traveler.getLastName();
        }
        
        return currentUser.getEmail();
    }

    public UserProfileDTO getCurrentUserProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof JwtUserDetails userDetails) {
            User user = getUserByEmail(userDetails.username());
            return UserProfileDTO.fromUser(user);
        }
        throw new AccessDeniedException("User not authenticated or principal type is incorrect");
    }

    public User getCurrentAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authenticated: " + (auth != null && auth.isAuthenticated()));
        System.out.println("Principal class: " + (auth != null ? auth.getPrincipal().getClass() : "null"));
        System.out.println("Principal value: " + (auth != null ? auth.getPrincipal() : "null"));
        if (principal instanceof JwtUserDetails userDetails) {
            return userRepository.findByEmail(userDetails.username())
                    .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found in database"));
        }
        // Este caso no debería ocurrir si el filtro de seguridad funciona correctamente
        throw new AccessDeniedException("User not authenticated or principal type is incorrect");
    }


    /**
     * Actualiza el perfil de un usuario (Traveler)
     */
    public UserProfileDTO updateUserProfile(UpdateProfileRequestDTO data) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!(principal instanceof JwtUserDetails userDetails)) {
            throw new AccessDeniedException("User not authenticated or principal type is incorrect");
        }

        User user = getUserByEmail(userDetails.username());

        if (user instanceof Traveler traveler) {
            traveler.setFirstName(data.firstName());
            traveler.setLastName(data.lastName());
            userRepository.save(traveler);
            return UserProfileDTO.fromUser(traveler);
        } else {
            throw new IllegalStateException("El perfil solo puede ser actualizado por usuarios de tipo Traveler.");
        }
    }

    /**
     * Añade experiencia a un usuario traveler
     */
    public void addXpToUser(String email, Integer xpToAdd) {
        User user = getUserByEmail(email);
        if (user instanceof Traveler traveler) {
            int oldLevel = traveler.getLevel();
            traveler.addXp(xpToAdd);
            userRepository.save(traveler);
            
            int newLevel = traveler.getLevel();
            if (newLevel > oldLevel) {
                System.out.println("¡Usuario " + email + " subió al nivel " + newLevel + "!");
                // Aquí podrías enviar una notificación o email
            }
        }
    }

    /**
     * Calcula y añade XP por una reseña
     */
    public void addXpForReview(String email, int rating, boolean hasPhotos, int reviewLength) {
        int baseXp = 50;
        int photoBonus = hasPhotos ? 25 : 0;
        int lengthBonus = reviewLength > 200 ? 25 : 0;
        int ratingBonus = rating >= 4 ? 10 : 0;
        
        int totalXp = baseXp + photoBonus + lengthBonus + ratingBonus;
        addXpToUser(email, totalXp);
    }

    /**
     * Calcula y añade XP por una compra/reserva
     */
    public void addXpForPurchase(String email, Double purchaseAmount) {
        // 1 XP por cada $10 gastados
        int xpToAdd = (int) (purchaseAmount / 10);
        addXpToUser(email, xpToAdd);
    }
}