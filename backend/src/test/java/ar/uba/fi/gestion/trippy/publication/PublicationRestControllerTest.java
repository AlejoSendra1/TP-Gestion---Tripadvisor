// Contenido de: PublicationRestControllerTest.java
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
import ar.uba.fi.gestion.trippy.publication.dto.HotelCreateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.ActivityCreateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.CoworkingCreateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.RestaurantCreateDTO;
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

// --- ¡¡NUEVOS IMPORTS PARA DELETE!! ---
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
// --- FIN IMPORTS ---

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
// --- Imports NUEVOS ---
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// --- Fin Imports NUEVOS ---
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;


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
     * Configuración de Mocks para el @WebMvcTest
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

    // --- Variables de prueba ---
    private Location testLocation;

    // DTOs de respuesta
    private PublicationListDTO listDto1;
    private PublicationDetailDTO detailDtoHotel;
    private PublicationDetailDTO detailDtoActivity; // Para las respuestas
    private PublicationDetailDTO detailDtoCoworking;
    private PublicationDetailDTO detailDtoRestaurant;

    // DTOs de entrada (Request)
    private HotelCreateDTO hotelCreateDto;
    private ActivityCreateDTO activityCreateDto;
    private CoworkingCreateDTO coworkingCreateDto;
    private RestaurantCreateDTO restaurantCreateDto;

    // Detalles del Host
    private String hostEmail = "host@test.com";
    private String hostToken = "TOKEN_VALIDO_HOST";
    private JwtUserDetails hostDetails = new JwtUserDetails(hostEmail, "HOST");

    // Detalles de otro rol (para 403)
    private String ownerEmail = "owner@test.com";
    private String ownerToken = "TOKEN_VALIDO_OWNER";
    private JwtUserDetails ownerDetails = new JwtUserDetails(ownerEmail, "GUEST");


    @BeforeEach
    void setUp() {
        Mockito.reset(publicationServiceMock, jwtServiceMock);
        testLocation = new Location();
        testLocation.setCity("Buenos Aires");

        // --- DTOs de respuesta (para mockear el servicio) ---
        PublicationDetailDTO.HostDTO hostDto = new PublicationDetailDTO.HostDTO(100L, "Test Host","ongoporongo@gmail.com", null);

        listDto1 = new PublicationListDTO(
                1L, "Test Hotel", 150.0, "Buenos Aires", "Argentina",
                "http://img.com/main.png", "Hotel"
        );

        detailDtoHotel = new PublicationDetailDTO(
                1L, "Test Hotel", "Descripción detallada", 150.0, testLocation,
                hostDto, List.of("http://img.com/1.png"), Collections.emptyList(),
                "Hotel", Map.of("roomCount", 50)
        );

        detailDtoActivity = new PublicationDetailDTO(
                2L, "Test Activity", "Descripción Actividad", 50.0, testLocation,
                hostDto, Collections.emptyList(), Collections.emptyList(),
                "Activity", Map.of("durationInHours", 3)
        );

        detailDtoCoworking = new PublicationDetailDTO(
                3L, "Test Coworking", "Descripción Coworking", 25.0, testLocation,
                hostDto, Collections.emptyList(), Collections.emptyList(),
                "Coworking", Map.of("services", List.of("Wifi"))
        );

        detailDtoRestaurant = new PublicationDetailDTO(
                4L, "Test Restaurant", "Descripción Restaurant", 40.0, testLocation,
                hostDto, Collections.emptyList(), Collections.emptyList(),
                "Restaurant", Map.of("cuisineType", "Italiana")
        );

        // --- DTOs de entrada (para enviar en el POST) ---
        hotelCreateDto = new HotelCreateDTO(
                "Hotel Creado", "Descripción", 200.0,
                testLocation, "http://img.com/main.png", Collections.emptyList(),
                10, 20 // roomCount y capacity
        );

        activityCreateDto = new ActivityCreateDTO(
                "Actividad Creada", "Desc", 50.0, testLocation,
                "http://img.com/act.png", Collections.emptyList(),
                3, "Obelisco", "Guía", "Moderado", "Español"
        );

        coworkingCreateDto = new CoworkingCreateDTO(
                "Coworking Creado", "Desc", 15.0, testLocation,
                "http://img.com/co.png", Collections.emptyList(),
                25.0, 300.0, List.of("Wifi", "Café")
        );

        restaurantCreateDto = new RestaurantCreateDTO(
                "Restaurant Creado", "Desc", 40.0, testLocation,
                "http://img.com/resto.png", Collections.emptyList(),
                "Italiana", "$$$", "12:00-23:00", "http://menu.com"
        );

        // --- Mock de Seguridad (JWT Service) ---
        // Le decimos al JwtService (mock) qué devolver cuando vea estos tokens
        when(jwtServiceMock.extractVerifiedUserDetails(hostToken))
                .thenReturn(Optional.of(hostDetails));
        when(jwtServiceMock.extractVerifiedUserDetails(ownerToken))
                .thenReturn(Optional.of(ownerDetails));
    }

    // --- Tests GET (sin cambios) ---
    @Test
    void whenGetAllPublications_shouldReturn200_andListOfDTOs() throws Exception {
        when(publicationServiceMock.getAllPublications()).thenReturn(List.of(listDto1));

        mockMvc.perform(get("/publications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Test Hotel")));
    }

    @Test
    void whenGetPublicationById_withValidId_shouldReturn200_andDetailDTO() throws Exception {
        when(publicationServiceMock.getPublicationById(1L)).thenReturn(detailDtoHotel);

        mockMvc.perform(get("/publications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.specificDetails.roomCount", is(50)));
    }

    @Test
    void whenGetPublicationById_withInvalidId_shouldReturn404() throws Exception {
        when(publicationServiceMock.getPublicationById(99L))
                .thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/publications/99"))
                .andExpect(status().isNotFound());
    }

    // --- Tests POST /hotel (sin cambios) ---

    @Test
    void whenCreateHotel_asHost_shouldReturn201() throws Exception {
        // Mock del servicio
        when(publicationServiceMock.createHotel(any(HotelCreateDTO.class), eq(hostEmail)))
                .thenReturn(detailDtoHotel); // Devuelve el DTO de hotel

        mockMvc.perform(post("/publications/hotel")
                        .header("Authorization", "Bearer " + hostToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hotelCreateDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Test Hotel")));
    }

    @Test
    void whenCreateHotel_asOwner_shouldReturn403() throws Exception {
        mockMvc.perform(post("/publications/hotel")
                        .header("Authorization", "Bearer " + ownerToken) // Rol incorrecto
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hotelCreateDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void whenCreateHotel_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(post("/publications/hotel") // Sin token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hotelCreateDto)))
                .andExpect(status().isUnauthorized());
    }

    // --- (Tests POST /activity, /coworking, /restaurant...) ---
    // (Omitidos por brevedad, ya los tenías)

    @Test
    void whenCreateActivity_asHost_shouldReturn201() throws Exception {
        when(publicationServiceMock.createActivity(any(ActivityCreateDTO.class), eq(hostEmail)))
                .thenReturn(detailDtoActivity);
        mockMvc.perform(post("/publications/activity")
                        .header("Authorization", "Bearer " + hostToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activityCreateDto)))
                .andExpect(status().isCreated());
    }

    @Test
    void whenCreateCoworking_asHost_shouldReturn201() throws Exception {
        when(publicationServiceMock.createCoworking(any(CoworkingCreateDTO.class), eq(hostEmail)))
                .thenReturn(detailDtoCoworking);
        mockMvc.perform(post("/publications/coworking")
                        .header("Authorization", "Bearer " + hostToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(coworkingCreateDto)))
                .andExpect(status().isCreated());
    }

    @Test
    void whenCreateRestaurant_asHost_shouldReturn201() throws Exception {
        when(publicationServiceMock.createRestaurant(any(RestaurantCreateDTO.class), eq(hostEmail)))
                .thenReturn(detailDtoRestaurant);
        mockMvc.perform(post("/publications/restaurant")
                        .header("Authorization", "Bearer " + hostToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restaurantCreateDto)))
                .andExpect(status().isCreated());
    }


    // --- ¡¡NUEVO!! Tests de ELIMINACIÓN (DELETE) ---

    @Test
    void whenDeletePublication_asHost_shouldReturn204() throws Exception {
        // 1. Arrange
        // Simulamos que el servicio (mock) NO lanza excepción
        doNothing().when(publicationServiceMock).deletePublication(1L, hostEmail);

        // 2. Act & 3. Assert
        mockMvc.perform(delete("/publications/1")
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isNoContent()); // 204 No Content

        // Verificamos que el controller llamó al servicio
        verify(publicationServiceMock).deletePublication(1L, hostEmail);
    }

    @Test
    void whenDeletePublication_asWrongRole_shouldReturn403() throws Exception {
        // 1. Arrange
        // (El token "ownerToken" tiene rol "OWNER")

        // 2. Act & 3. Assert
        mockMvc.perform(delete("/publications/1")
                        .header("Authorization", "Bearer " + ownerToken)) // Rol incorrecto
                .andExpect(status().isForbidden()); // 403 Forbidden (de SecurityConfig)

        // Verificamos que NUNCA se llamó al servicio
        verify(publicationServiceMock, never()).deletePublication(anyLong(), anyString());
    }

    @Test
    void whenDeletePublication_unauthenticated_shouldReturn401() throws Exception {
        // 2. Act & 3. Assert
        mockMvc.perform(delete("/publications/1")) // Sin token
                .andExpect(status().isUnauthorized()); // 401 Unauthorized
    }

    @Test
    void whenDeletePublication_withInvalidId_shouldReturn404() throws Exception {
        // 1. Arrange
        // Simulamos que el servicio lanza "No encontrado"
        doThrow(new EntityNotFoundException("No encontrado"))
                .when(publicationServiceMock).deletePublication(99L, hostEmail);

        // 2. Act & 3. Assert
        mockMvc.perform(delete("/publications/99") // ID 99
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isNotFound()); // 404 Not Found (del @ExceptionHandler)
    }

    @Test
    void whenDeletePublication_asWrongOwner_shouldReturn403() throws Exception {
        // 1. Arrange
        // Simulamos que el servicio lanza "No tenés permisos"
        doThrow(new IllegalStateException("No tenés permisos"))
                .when(publicationServiceMock).deletePublication(2L, hostEmail);

        // 2. Act & 3. Assert
        mockMvc.perform(delete("/publications/2") // ID 2 (de otro dueño)
                        .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isForbidden()); // 403 Forbidden (del NUEVO @ExceptionHandler)
    }

}