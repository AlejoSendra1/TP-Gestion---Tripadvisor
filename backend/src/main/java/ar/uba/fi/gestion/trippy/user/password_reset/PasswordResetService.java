package ar.uba.fi.gestion.trippy.user.password_reset;

import org.springframework.beans.factory.annotation.Value;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import ar.uba.fi.gestion.trippy.user.email_validation.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Value("http://localhost:30003")
    private String frontendBaseUrl;

    @Autowired
    public PasswordResetService(UserRepository userRepository, PasswordResetTokenRepository passwordResetTokenRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    public void requestPasswordReset(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) { throw new UsernameNotFoundException("User not found");}
        if (!user.get().isEmailVerified()) {throw new UsernameNotFoundException("User is not verified");}
        Optional<PasswordResetToken> existingToken = passwordResetTokenRepository.findByUser(user.get());
        if (existingToken.isPresent()) { passwordResetTokenRepository.delete(existingToken.get());}

        String token= UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user.get());

        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendBaseUrl + "/password_reset/new_password?token=" + token;
        emailService.sendEmail(email, "Password reset link", "Click here to reset your password:\n" + resetLink);

    }
}
