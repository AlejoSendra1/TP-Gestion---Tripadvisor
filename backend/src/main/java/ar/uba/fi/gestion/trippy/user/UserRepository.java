package ar.uba.fi.gestion.trippy.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User>findByEmail(String email);
    Optional<User>findByTokenVerified(String verificationToken);
}
