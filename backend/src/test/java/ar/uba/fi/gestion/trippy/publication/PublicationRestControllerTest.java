package ar.uba.fi.gestion.trippy.publication;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ar.uba.fi.gestion.trippy.config.security.JwtService;
import org.mockito.Mockito;

import ar.uba.fi.gestion.trippy.common.location.Location;
// --- Imports NUEVOS ---
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.publication.dto.CreateHotelDTO;
// --- Fin Imports NUEVOS ---
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import ar.uba.fi.gestion.trippy.config.security.SecurityConfig;
import jakarta.persistence.EntityNotFoundException;

// --- Imports NUEVOS ---
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional; // Para mockear JwtService
import com.fasterxml.jackson.databind.ObjectMapper; // Para convertir a JSON
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
// --- Fin Imports NUEVOS ---

import static org.mockito.Mockito.when;
// --- Imports NUEVOS ---
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// --- Fin Imports NUEVOS ---
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;

import jakarta.servlet.http.HttpServletResponse;


@WebMvcTest(PublicationRestController.class)
@Import(SecurityConfig.class) // Carga tu SecurityConfig real
public class PublicationRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper; // Spring lo provee para convertir DTOs a JSON

    @Autowired
    private PublicationService publicationServiceMock; // Mock de tu @TestConfiguration

    @Autowired
    private JwtService jwtServiceMock; // Mock de tu @TestConfiguration

    /**
     * Esta es tu configuración original, ¡está perfecta!
     * Le decimos a Spring: "Carga el @WebMvcTest, pero cuando
     * SecurityConfig pida el JwtService, dale este MOCK".
     */
    @TestConfiguration
    static class ControllerTestConfig {
        @Bean
        public PublicationService publicationService() {
            return Mockito.mock(PublicationService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }
    }

    // Variables de prueba
    private PublicationListDTO listDto1;
    private PublicationDetailDTO detailDto1;
    private CreateHotelDTO createDto; // DTO de entrada para el POST

    @BeforeEach
    void setUp() {
        // ... (Tu setUp original para listDto1 y detailDto1)
        listDto1 = new PublicationListDTO(
                1L, "Test Hotel", 150.0, "Buenos Aires", "Argentina",
                "http://img.com/main.png", "Hotel"
        );
        PublicationDetailDTO.HostDTO hostDto = new PublicationDetailDTO.HostDTO(100L, "Test Host", null);
        Location location = new Location();
        location.setCity("Buenos Aires");
        detailDto1 = new PublicationDetailDTO(
                1L, "Test Hotel", "Descripción detallada", 150.0, location,
                hostDto, List.of("http://img.com/1.png"), Collections.emptyList(),
                "Hotel", Map.of("roomCount", 50)
        );
        // ---

        // Preparamos el DTO de entrada para los tests POST
        createDto = new CreateHotelDTO(
                "Hotel Creado", "Descripción", 200.0,
                location, "http://img.com/main.png", Collections.emptyList(),
                10, 20 // roomCount y capacity
        );
    }

    // --- Tests GET (tus tests originales) ---

    @Test
    void whenGetAllPublications_shouldReturn200_andListOfDTOs() throws Exception {
        when(publicationServiceMock.getAllPublications()).thenReturn(List.of(listDto1));

        mockMvc.perform(get("/publications")) // Quitamos el prefijo /api/v1 que tenías
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Test Hotel")));
    }

    @Test
    void whenGetPublicationById_withValidId_shouldReturn200_andDetailDTO() throws Exception {
        when(publicationServiceMock.getPublicationById(1L)).thenReturn(detailDto1);

        mockMvc.perform(get("/publications/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.host.name", is("Test Host")))
                .andExpect(jsonPath("$.specificDetails.roomCount", is(50)));
    }

    @Test
    void whenGetPublicationById_withInvalidId_shouldReturn404() throws Exception {
        String errorMsg = "Publicación no encontrada";
        when(publicationServiceMock.getPublicationById(99L))
                .thenThrow(new EntityNotFoundException(errorMsg));

        mockMvc.perform(get("/publications/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(errorMsg));
    }

    // --- ¡NUEVOS TESTS PARA US #23 (POST)! ---

    @Test
    void whenCreateHotel_asHost_shouldReturn201() throws Exception {
        // 1. Arrange
        String hostEmail = "host@test.com";
        String hostToken = "TOKEN_VALIDO_HOST";

        // Creamos el Principal que el filtro JWT debe generar
        JwtUserDetails hostDetails = new JwtUserDetails(hostEmail, "HOST");

        // Le decimos al JwtService (mock) qué devolver cuando vea este token
        when(jwtServiceMock.extractVerifiedUserDetails(hostToken))
                .thenReturn(Optional.of(hostDetails));

        // Le decimos al PublicationService (mock) qué devolver
        // (Usamos el DTO de detalle que ya teníamos para la respuesta)
        when(publicationServiceMock.createHotel(any(CreateHotelDTO.class), eq(hostEmail)))
                .thenReturn(detailDto1);

        // 2. Act & 3. Assert
        mockMvc.perform(post("/publications/hotel")
                        .header("Authorization", "Bearer " + hostToken) // ¡Simulamos el login!
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto))) // Enviamos el DTO de entrada

                .andExpect(status().isCreated()) // 201 Created
                .andExpect(jsonPath("$.id", is(1))) // Verificamos la respuesta
                .andExpect(jsonPath("$.title", is("Test Hotel")));
    }

    @Test
    void whenCreateHotel_asOwner_shouldReturn403() throws Exception {
        // 1. Arrange
        String ownerEmail = "owner@test.com";
        String ownerToken = "TOKEN_VALIDO_OWNER";

        // Creamos un Principal con el rol incorrecto
        JwtUserDetails ownerDetails = new JwtUserDetails(ownerEmail, "OWNER");

        when(jwtServiceMock.extractVerifiedUserDetails(ownerToken))
                .thenReturn(Optional.of(ownerDetails));

        // (No necesitamos mockear el publicationService porque la seguridad
        // debe frenar la request ANTES de que llegue al servicio)

        // 2. Act & 3. Assert
        mockMvc.perform(post("/publications/hotel")
                        .header("Authorization", "Bearer " + ownerToken) // ¡Logueado como OWNER!
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))

                .andExpect(status().isForbidden()); // 403 Forbidden!
    }

    @Test
    void whenCreateHotel_unauthenticated_shouldReturn401() throws Exception {
        // 1. Arrange
        // No mockeamos el JwtService, por lo que el filtro
        // no encontrará un Principal y fallará la autenticación.

        // 2. Act & 3. Assert
        mockMvc.perform(post("/publications/hotel") // ¡Sin header "Authorization"!
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))

                .andExpect(status().isUnauthorized()); // 401 Unauthorized!
    }
}