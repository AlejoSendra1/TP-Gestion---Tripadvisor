package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.config.security.JwtService;
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.config.security.SecurityConfig;
import ar.uba.fi.gestion.trippy.user.dto.LevelInfoDTO;
import ar.uba.fi.gestion.trippy.user.dto.UpdateProfileRequestDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserProfileDTO;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.is;


@WebMvcTest(UserRestController.class)
@Import(SecurityConfig.class) // Carga tu SecurityConfig real
public class UserRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper; // Para convertir DTOs a JSON

    @Autowired
    private UserService userServiceMock; // Mock de tu @TestConfiguration

    @Autowired
    private JwtService jwtServiceMock; // Mock de tu @TestConfiguration

    /**
     * Configuración de Mocks para el @WebMvcTest
     */
    @TestConfiguration
    static class ControllerTestConfig {
        @Bean
        public UserService userService() {
            return Mockito.mock(UserService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }
    }

    // --- Datos de prueba ---
    private UpdateProfileRequestDTO updateDto;
    private UserProfileDTO updatedProfileDto;

    // Detalles del Traveler (USER)
    private String travelerEmail = "traveler@test.com";
    private String travelerToken = "TOKEN_VALIDO_TRAVELER";
    private JwtUserDetails travelerDetails = new JwtUserDetails(travelerEmail, "USER");

    // Detalles del Host (HOST)
    private String hostEmail = "host@test.com";
    private String hostToken = "TOKEN_VALIDO_HOST";
    private JwtUserDetails hostDetails = new JwtUserDetails(hostEmail, "HOST");


    @BeforeEach
    void setUp() {
        Mockito.reset(userServiceMock, jwtServiceMock);

        // DTO de entrada (Request)
        updateDto = new UpdateProfileRequestDTO("Nombre", "Nuevo");

        // DTO de respuesta (mockeado por el servicio)
        LevelInfoDTO levelInfo = new LevelInfoDTO(1, 0, 500, 500, 0.0, "Beneficios", 0);
        updatedProfileDto = new UserProfileDTO(
                1L, "Nombre", "Nuevo", travelerEmail, null,
                levelInfo, 0, 0, 0, 0
        );

        // --- Mock de Seguridad (JWT Service) ---
        when(jwtServiceMock.extractVerifiedUserDetails(travelerToken))
                .thenReturn(Optional.of(travelerDetails));
        when(jwtServiceMock.extractVerifiedUserDetails(hostToken))
                .thenReturn(Optional.of(hostDetails));
    }

    @Test
    void whenUpdateProfile_asTraveler_shouldReturn200() throws Exception {
        // 1. Arrange
        // Simulamos que el servicio funciona OK
        when(userServiceMock.updateUserProfile(any(UpdateProfileRequestDTO.class)))
                .thenReturn(updatedProfileDto);

        // 2. Act & 3. Assert
        mockMvc.perform(put("/users/profile")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", is("Nombre")))
                .andExpect(jsonPath("$.lastName", is("Nuevo")));
    }

    @Test
    void whenUpdateProfile_asHost_shouldReturn403() throws Exception {
        // 1. Arrange
        // Simulamos que el servicio lanza la excepción (porque no es un Traveler)
        when(userServiceMock.updateUserProfile(any(UpdateProfileRequestDTO.class)))
                .thenThrow(new IllegalStateException("El perfil solo puede ser actualizado por usuarios de tipo Traveler.")); // <-- CAMBIO AQUÍ

        // 2. Act & 3. Assert
        mockMvc.perform(put("/users/profile")
                        .header("Authorization", "Bearer " + hostToken) // Token de HOST
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden()); // <-- ¡CAMBIO AQUÍ! Esperamos 403
    }

    @Test
    void whenUpdateProfile_unauthenticated_shouldReturn401() throws Exception {
        // 2. Act & 3. Assert
        mockMvc.perform(put("/users/profile") // Sin token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isUnauthorized()); // 401 Unauthorized
    }

    @Test
    void whenUpdateProfile_withInvalidData_shouldReturn400() throws Exception {
        // 1. Arrange
        // DTO inválido (firstName está vacío)
        UpdateProfileRequestDTO invalidDto = new UpdateProfileRequestDTO("", "Apellido");

        // 2. Act & 3. Assert
        mockMvc.perform(put("/users/profile")
                        .header("Authorization", "Bearer " + travelerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest()); // 400 Bad Request (por @Valid)
    }

}