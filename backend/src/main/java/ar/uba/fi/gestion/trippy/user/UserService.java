package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.common.exception.DuplicateEntityException;
import ar.uba.fi.gestion.trippy.config.security.JwtService;
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.user.email_validation.EmailService;
import ar.uba.fi.gestion.trippy.user.password_reset.PasswordChangeService;
import ar.uba.fi.gestion.trippy.user.password_reset.PasswordResetService;
import ar.uba.fi.gestion.trippy.user.password_reset.PasswordResetTokenRepository;
import ar.uba.fi.gestion.trippy.user.refresh_token.RefreshToken;
import ar.uba.fi.gestion.trippy.user.refresh_token.RefreshTokenService;


import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetService passwordResetService;
    private final PasswordChangeService passwordChangeService;


    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService,
            EmailService emailService, PasswordResetTokenRepository passwordResetTokenRepository, PasswordResetService passwordResetService, PasswordChangeService passwordChangeService) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordResetService = passwordResetService;
        this.passwordChangeService = passwordChangeService;
    }

    public Optional<TokenDTO> createUser(UserCreateDTO data) {
        System.out.println("se esta creando el user");
        if (userRepository.findByEmail(data.email()).isPresent()) {
            throw new DuplicateEntityException("User", "email");
        }

        var user = data.asUser(passwordEncoder::encode);

        user.setRole("HOST");

        String verificationToken = UUID.randomUUID().toString();
        user.setTokenVerified(verificationToken);
        user.setEmailVerified(false);
        userRepository.save(user);
        //emailService.sendValidationEmail(user.getEmail(), verificationToken);
        return Optional.of(generateTokens(user));
    }

    public Optional<UserDTO> loginUser(UserCredentials data) {

        Optional<User> maybeUser = userRepository.findByEmail(data.email())
                .filter(user -> passwordEncoder.matches(data.password(), user.getPassword()));

        // .filter(User::isEmailVerified); PARA VERIFICACION DE MAILS
        // .map(this::generateTokens); POR SI QUEREMOS TOKENS ?

        return maybeUser.map(user -> {
            TokenDTO tokenDTO = generateTokens(user); // Your token generation method
            return new UserDTO(
                    user.getFirstname(),
                    0, // userXP - you'll need to get this from somewhere
                    1, // userLevel - you'll need to get this from somewhere
                    user.getRole(),
                    tokenDTO
            );
        });
    }

    Optional<TokenDTO> refresh(RefreshDTO data) {
        return refreshTokenService.findByValue(data.refreshToken())
                .map(RefreshToken::user)
                .map(this::generateTokens);
    }

    private TokenDTO generateTokens(User user) {
        String accessToken = jwtService.createToken(new JwtUserDetails(
                user.getEmail(),
                user.getRole()
        ));
        RefreshToken refreshToken = refreshTokenService.createFor(user);
        return new TokenDTO(accessToken, refreshToken.value());
    }

    public boolean verifyEmailToken(String token) {
        return userRepository.findByTokenVerified(token).map(user->{
            user.setEmailVerified(true);
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
        return currentUser.getFirstname();
    }
    public UserProfileDTO getCurrentUserProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof JwtUserDetails userDetails) {
            User user = getUserByEmail(userDetails.username());
            return UserProfileDTO.fromUser(user);
        }
        throw new AccessDeniedException("User not authenticated or principal type is incorrect");
    }
}
