package ar.uba.fi.ingsoft1.todo_template.user.password_reset;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PasswordChangeService {
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired

    public PasswordChangeService(PasswordResetTokenRepository passwordResetTokenRepository, UserRepository userRepository, PasswordEncoder passwordEncoder){

        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void resetPassword(String token, String newPassword){
        Optional<PasswordResetToken> maybeResetToken = passwordResetTokenRepository.findByToken(token);
        if(maybeResetToken.isEmpty()){throw new IllegalArgumentException("Invalid token");}
        PasswordResetToken passwordResetToken = maybeResetToken.get();
        if(passwordResetToken.isExpired()) {
            passwordResetTokenRepository.delete(passwordResetToken);
            throw new IllegalArgumentException("Invalid token");
        }
        User user = passwordResetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
       passwordResetTokenRepository.delete(passwordResetToken);

    }
}
