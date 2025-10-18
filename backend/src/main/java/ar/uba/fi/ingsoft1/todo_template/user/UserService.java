package ar.uba.fi.ingsoft1.todo_template.user;

import ar.uba.fi.ingsoft1.todo_template.common.exception.DuplicateEntityException;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtService;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.user.email_validation.EmailService;
import ar.uba.fi.ingsoft1.todo_template.user.password_reset.PasswordChangeService;
import ar.uba.fi.ingsoft1.todo_template.user.password_reset.PasswordResetService;
import ar.uba.fi.ingsoft1.todo_template.user.password_reset.PasswordResetTokenRepository;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshToken;
import ar.uba.fi.ingsoft1.todo_template.user.refresh_token.RefreshTokenService;


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
        if (userRepository.findByEmail(data.email()).isPresent()) {
            throw new DuplicateEntityException("User", "email");
        }

        var user = data.asUser(passwordEncoder::encode);
        String verificationToken = UUID.randomUUID().toString();
        user.setTokenVerified(verificationToken);
        user.setEmailVerified(false);
        userRepository.save(user);
        emailService.sendValidationEmail(user.getEmail(), verificationToken);
        return Optional.of(generateTokens(user));
    }

    public Optional<TokenDTO> loginUser(UserCredentials data) {
        Optional<User> maybeUser = userRepository.findByEmail(data.email());
        return maybeUser
                .filter(user -> passwordEncoder.matches(data.password(), user.getPassword()))
                .filter(User::isEmailVerified)
                .map(this::generateTokens);
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
        return currentUser.getName();
    }
    public UserProfileDTO getCurrentUserProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof JwtUserDetails userDetails) {
            User user = getUserByEmail(userDetails.username());
            user.getZones();
            return UserProfileDTO.fromUser(user);
        }
        throw new AccessDeniedException("User not authenticated or principal type is incorrect");
    }
}
