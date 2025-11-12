package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.user.dto.UpdateProfileRequestDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserProfileDTO;
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.user.refresh_token.RefreshTokenService;
import ar.uba.fi.gestion.trippy.config.security.JwtService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepositoryMock;
    @Mock
    private PasswordEncoder passwordEncoderMock; // Necesario para el constructor
    @Mock
    private JwtService jwtServiceMock; // Necesario para el constructor
    @Mock
    private RefreshTokenService refreshTokenServiceMock; // Necesario para el constructor

    @InjectMocks
    private UserService userService;

    // --- Mocks para Seguridad ---
    @Mock
    private SecurityContext securityContextMock;
    @Mock
    private Authentication authenticationMock;

    // --- Datos de prueba ---
    private Traveler testTraveler;
    private BusinessOwner testHost;
    private UpdateProfileRequestDTO updateDto;
    private String travelerEmail = "traveler@test.com";
    private String hostEmail = "host@test.com";

    @BeforeEach
    void setUp() {
        // Instanciamos el servicio manualmente (o dejamos que @InjectMocks lo haga)
        // userService = new UserService(jwtServiceMock, passwordEncoderMock, userRepositoryMock, refreshTokenServiceMock);

        // --- Configuración de datos ---
        testTraveler = new Traveler("traveler@test.com", "pass", "Nombre", "Viejo");
        testHost = new BusinessOwner("host@test.com", "pass", "Host Negocio", "HOTEL");

        updateDto = new UpdateProfileRequestDTO("Nombre", "Nuevo");

        // --- Mock del SecurityContextHolder ---
        // Esto es necesario porque el UserService usa SecurityContextHolder
        lenient().when(securityContextMock.getAuthentication()).thenReturn(authenticationMock);
        SecurityContextHolder.setContext(securityContextMock);
    }

    private void mockSecurityPrincipal(String email, String role) {
        JwtUserDetails userDetails = new JwtUserDetails(email, role);
        lenient().when(authenticationMock.getPrincipal()).thenReturn(userDetails);
    }

    @Test
    void whenUpdateUserProfile_asTraveler_shouldUpdateAndReturnDTO() {
        // 1. Arrange
        mockSecurityPrincipal(travelerEmail, "USER");
        when(userRepositoryMock.findByEmail(travelerEmail)).thenReturn(Optional.of(testTraveler));
        when(userRepositoryMock.save(any(Traveler.class))).thenReturn(testTraveler);

        // 2. Act
        UserProfileDTO resultDTO = userService.updateUserProfile(updateDto);

        // 3. Assert
        verify(userRepositoryMock).findByEmail(travelerEmail);
        verify(userRepositoryMock).save(testTraveler);

        // Verificamos que los datos se actualizaron ANTES de guardarse
        assertThat(testTraveler.getFirstName()).isEqualTo("Nombre");
        assertThat(testTraveler.getLastName()).isEqualTo("Nuevo");

        // Verificamos el DTO de respuesta
        assertThat(resultDTO.firstName()).isEqualTo("Nombre");
        assertThat(resultDTO.lastName()).isEqualTo("Nuevo");
    }

    @Test
    void whenUpdateUserProfile_asHost_shouldThrowException() {
        // 1. Arrange
        mockSecurityPrincipal(hostEmail, "HOST");
        when(userRepositoryMock.findByEmail(hostEmail)).thenReturn(Optional.of(testHost));

        // 2. Act & 3. Assert
        assertThatThrownBy(() -> {
            userService.updateUserProfile(updateDto);
        })
                // ---------  ¡CAMBIO AQUÍ!  ---------
                .isInstanceOf(IllegalStateException.class) // Ya no es ResponseStatusException
                .hasMessageContaining("solo puede ser actualizado por usuarios de tipo Traveler");

        // Verificamos que NUNCA se llamó a save
        verify(userRepositoryMock, never()).save(any());
    }

    @Test
    void whenUpdateUserProfile_withInvalidPrincipal_shouldThrowException() {
        // 1. Arrange
        // Simulamos un principal que no es JwtUserDetails
        lenient().when(authenticationMock.getPrincipal()).thenReturn(new Object());

        // 2. Act & 3. Assert
        assertThatThrownBy(() -> {
            userService.updateUserProfile(updateDto);
        })
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("User not authenticated");
    }
}