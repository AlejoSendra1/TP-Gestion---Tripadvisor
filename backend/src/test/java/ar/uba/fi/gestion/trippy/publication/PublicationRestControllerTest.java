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
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import ar.uba.fi.gestion.trippy.config.security.SecurityConfig;
import jakarta.persistence.EntityNotFoundException;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;


@WebMvcTest(PublicationRestController.class)
@Import(SecurityConfig.class)
public class PublicationRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * @MockBean ya no se usa.
     * En su lugar, @Autowired inyecta el mock que definimos
     * en la @TestConfiguration de abajo.
     */
    @Autowired
    private PublicationService publicationServiceMock; // <-- ¡Ahora es @Autowired!

    /**
     * ¡LA NUEVA FORMA!
     * Esta clase interna le dice a Spring: "Para este test,
     * cuando alguien pida un @Bean de PublicationService,
     * no crees uno real, entrégale este MOCK que yo creé".
     */
    @TestConfiguration
    static class ControllerTestConfig {
        @Bean
        public PublicationService publicationService() {
            // Creamos el mock manualmente
            return Mockito.mock(PublicationService.class);
        }

        @Bean // <-- ¡AGREGÁ ESTE MÉTODO!
        public JwtService jwtService() {
            // Creamos un mock. No hace nada, pero existe,
            // que es lo que el contexto necesita para arrancar.
            return Mockito.mock(JwtService.class);
        }
    }

    // Variables de prueba
    private PublicationListDTO listDto1;
    private PublicationDetailDTO detailDto1;

    @BeforeEach
    void setUp() {
        // Preparamos nuestros DTOs de prueba
        listDto1 = new PublicationListDTO(
                1L,
                "Test Hotel",
                150.0,
                "Buenos Aires",
                "Argentina",
                "http://img.com/main.png",
                "Hotel"
        );

        PublicationDetailDTO.HostDTO hostDto = new PublicationDetailDTO.HostDTO(100L, "Test Host", null);
        Location location = new Location();
        location.setCity("Buenos Aires");

        detailDto1 = new PublicationDetailDTO(
                1L,
                "Test Hotel",
                "Descripción detallada",
                150.0,
                location,
                hostDto,
                List.of("http://img.com/1.png"),
                Collections.emptyList(),
                "Hotel",
                Map.of("roomCount", 50)
        );
    }

    @Test
    void whenGetAllPublications_shouldReturn200_andListOfDTOs() throws Exception {
        // 1. Arrange
        when(publicationServiceMock.getAllPublications()).thenReturn(List.of(listDto1));

        // 2. Act & 3. Assert
        mockMvc.perform(get("/api/v1/publications"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Test Hotel")));
    }

    @Test
    void whenGetPublicationById_withValidId_shouldReturn200_andDetailDTO() throws Exception {
        // 1. Arrange
        when(publicationServiceMock.getPublicationById(1L)).thenReturn(detailDto1);

        // 2. Act & 3. Assert
        mockMvc.perform(get("/api/v1/publications/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.host.name", is("Test Host")))
                .andExpect(jsonPath("$.specificDetails.roomCount", is(50)));
    }

    @Test
    void whenGetPublicationById_withInvalidId_shouldReturn404() throws Exception {
        // 1. Arrange
        Long invalidId = 99L;
        String errorMsg = "Publicación no encontrada con ID: " + invalidId;
        when(publicationServiceMock.getPublicationById(invalidId))
                .thenThrow(new EntityNotFoundException(errorMsg));

        // 2. Act & 3. Assert
        mockMvc.perform(get("/api/v1/publications/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(errorMsg));
    }

}