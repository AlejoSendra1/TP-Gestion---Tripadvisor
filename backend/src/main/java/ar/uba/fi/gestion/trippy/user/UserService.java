package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.common.exception.DuplicateEntityException;
import ar.uba.fi.gestion.trippy.config.security.JwtService;
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.user.dto.*;
import ar.uba.fi.gestion.trippy.user.refresh_token.RefreshToken;
import ar.uba.fi.gestion.trippy.user.refresh_token.RefreshTokenService;


import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        System.out.println("se esta creando el user");
        if (userRepository.findByEmail(data.email()).isPresent()) {
            throw new DuplicateEntityException("User", "email");
        }

        var user = data.asUser(passwordEncoder::encode);
        String verificationToken = UUID.randomUUID().toString();
        user.setTokenVerified(verificationToken);
        userRepository.save(user);
        //emailService.sendValidationEmail(user.getEmail(), verificationToken);
        TokenDTO tokens = Optional.of(generateTokens(user)).orElseThrow();

        return Optional.of(UserDTOFactory.fromUser(user,tokens));
    }

    public Optional<UserDTO> loginUser(UserLoginDTO data) {
        System.out.println("el login dto: "+ data.toString());
        User maybeUser = userRepository.findByEmail(data.getEmail())
                .filter(user -> passwordEncoder.matches(data.getPassword(), user.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // Generate tokens for the user
        TokenDTO tokenDTO = generateTokens(maybeUser);

        return Optional.of(UserDTOFactory.fromUser(maybeUser,tokenDTO));
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
            //user.setEmailVerified(true);
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
        //return currentUser.getFirstname();
        return "TODO -> getCurrentUserName - UserService";
    }
    public UserProfileDTO getCurrentUserProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof JwtUserDetails userDetails) {
            User user = getUserByEmail(userDetails.username());
            //return UserProfileDTO.fromUser(user);
            return new UserProfileDTO(0L,"todo","todo","todo@todo","todo.png");
        }
        throw new AccessDeniedException("User not authenticated or principal type is incorrect");
    }
}
