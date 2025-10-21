package ar.uba.fi.gestion.todo_template.user.password_reset;

import ar.uba.fi.gestion.todo_template.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);

    void deleteByUser(User user);
}
