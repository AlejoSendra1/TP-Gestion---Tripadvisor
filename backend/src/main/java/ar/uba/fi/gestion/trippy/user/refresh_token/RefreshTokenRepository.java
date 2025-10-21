package ar.uba.fi.gestion.trippy.user.refresh_token;

import org.springframework.data.jpa.repository.JpaRepository;

interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
}
