package ar.uba.fi.gestion.todo_template.user.refresh_token;

import org.springframework.data.jpa.repository.JpaRepository;

interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
}
