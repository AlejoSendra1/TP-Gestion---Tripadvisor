package ar.uba.fi.gestion.trippy.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final String secret;
    private final Long expiration;

    @Autowired
    JwtService(
            @Value("${jwt.access.secret}") String secret,
            @Value("${jwt.access.expiration}") Long expiration
    ) {
        this.secret = secret;
        this.expiration = expiration;
    }

    public String createToken(JwtUserDetails claims) {
        return Jwts.builder()
                .subject(claims.username())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .claim("userId", claims.userId())  // ✅ AÑADIDO: userId en el token
                .claim("role", claims.role())
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public Optional<JwtUserDetails> extractVerifiedUserDetails(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            // ✅ ACTUALIZADO: Verificar que el token tenga userId, username y role
            if (claims.containsKey("sub")
                    && claims.containsKey("userId")  // ✅ AÑADIDO
                    && claims.containsKey("role")
                    && claims.get("userId") instanceof Number  // ✅ AÑADIDO: Puede ser Integer o Long
                    && claims.get("role") instanceof String role
            ) {
                Long userId = ((Number) claims.get("userId")).longValue();  // ✅ AÑADIDO: Convertir a Long
                String username = claims.getSubject();
                
                System.out.println("✅ JWT extracted - User: " + username + ", ID: " + userId + ", Role: " + role);
                
                return Optional.of(new JwtUserDetails(userId, username, role));  // ✅ ACTUALIZADO: Incluir userId
            } else {
                System.err.println("⚠️ JWT missing required fields - userId: " + claims.containsKey("userId") 
                    + ", sub: " + claims.containsKey("sub") 
                    + ", role: " + claims.containsKey("role"));
            }
        } catch (Exception e) {
            System.err.println("❌ Error parsing JWT: " + e.getMessage());
        }
        return Optional.empty();
    }

    private SecretKey getSigningKey() {
        byte[] bytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(bytes);
    }
}