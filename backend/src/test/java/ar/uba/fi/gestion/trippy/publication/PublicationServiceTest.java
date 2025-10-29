// Contenido de: PublicationServiceTest.java
package ar.uba.fi.gestion.trippy.publication;
import ar.uba.fi.gestion.trippy.user.BusinessOwner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor; // Para capturar el objeto guardado
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ar.uba.fi.gestion.trippy.common.location.Location;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository; // ¡Importamos el repo de User!

// --- ¡¡NUEVOS IMPORTS!! ---
import ar.uba.fi.gestion.trippy.publication.dto.HotelCreateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.ActivityCreateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.CoworkingCreateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.RestaurantCreateDTO;
// --- FIN IMPORTS ---

import java.util.Collections;
import java.util.List; // Para Coworking
import java.util.Map; // Para el DTO de respuesta
import java.util.Optional;


// --- ¡¡NUEVOS IMPORTS PARA DELETE!! ---
import jakarta.persistence.EntityNotFoundException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
// --- FIN IMPORTS ---

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PublicationServiceTest {

    @Mock
    private PublicationRepository publicationRepositoryMock;

    @Mock
    private UserRepository userRepositoryMock; // <-- Mock para el repo de User

    @InjectMocks
    private PublicationService publicationService;

    // --- Variables de prueba ---
    private Hotel testHotel;
    private Restaurant testRestaurant;
    private Location testLocation;

    // Mocks para el Host
    private BusinessOwner mockHost;
    private String hostEmail = "host@test.com";

    // --- DTOs de entrada ---
    private HotelCreateDTO hotelCreateDto;
    private ActivityCreateDTO activityCreateDto;
    private CoworkingCreateDTO coworkingCreateDto;
    private RestaurantCreateDTO restaurantCreateDto;


    @BeforeEach
    void setUp() {
        // Instanciamos el servicio manualmente con sus mocks
        // (El @InjectMocks no funciona bien con constructores manuales a veces)
        publicationService = new PublicationService(publicationRepositoryMock, userRepositoryMock);

        // --- Host Mock ---
        mockHost = org.mockito.Mockito.mock(BusinessOwner.class);

        lenient().when(mockHost.getId()).thenReturn(100L);
        lenient().when(mockHost.getBusinessName()).thenReturn("Host Mockeado");
        lenient().when(mockHost.getEmail()).thenReturn(hostEmail);// <-- IMPORTANTE PARA EL DELETE

        testLocation = new Location();
        testLocation.setCity("Buenos Aires");
        testLocation.setCountry("Argentina");

        // --- Entidades (para tests GET y DELETE) ---
        testHotel = new Hotel();
        testHotel.setId(1L);
        testHotel.setTitle("Gran Hotel Test");
        testHotel.setHost(mockHost); // <-- Host asignado
        testHotel.setRoomCount(10);

        testRestaurant = new Restaurant();
        testRestaurant.setId(2L);
        testRestaurant.setHost(mockHost);

        // --- DTOs de creación (para tests POST) ---
        hotelCreateDto = new HotelCreateDTO(
                "Nuevo Hotel", "Descripción Hotel", 200.0,
                testLocation, "http://img.com/main.png", Collections.emptyList(),
                10, 20 // roomCount y capacity
        );

        activityCreateDto = new ActivityCreateDTO(
                "Nueva Actividad", "Descripción Actividad", 50.0,
                testLocation, "http://img.com/act.png", Collections.emptyList(),
                3, "Obelisco", "Guía y agua", "Moderado", "Español"
        );

        coworkingCreateDto = new CoworkingCreateDTO(
                "Nuevo Coworking", "Descripción Coworking", 15.0,
                testLocation, "http://img.com/co.png", Collections.emptyList(),
                25.0, 300.0, List.of("Wifi", "Café")
        );

        restaurantCreateDto = new RestaurantCreateDTO(
                "Nuevo Restaurant", "Descripción Restaurant", 40.0,
                testLocation, "http://img.com/resto.png", Collections.emptyList(),
                "Italiana", "$$$", "12:00-23:00", "http://menu.com"
        );
    }

    // --- (Tests GET existentes) ---

    @Test
    void whenGetPublicationById_withValidId_shouldReturnDetailDTO() {
        // Arrange
        when(publicationRepositoryMock.findById(1L)).thenReturn(Optional.of(testHotel));

        // Act
        PublicationDetailDTO resultDTO = publicationService.getPublicationById(1L);

        // Assert
        assertThat(resultDTO.host().id()).isEqualTo(100L);
        assertThat(resultDTO.host().name()).isEqualTo("Host Mockeado");
        assertThat(resultDTO.specificDetails().get("roomCount")).isEqualTo(10);
    }

    // --- Tests de CREACIÓN (POST) ---

    @Test
    void whenCreateActivity_shouldReturnCreatedActivityDTO() {
        // 1. Arrange
        when(userRepositoryMock.findByEmail(hostEmail)).thenReturn(Optional.of(mockHost));

        Activity savedActivity = new Activity();
        savedActivity.setId(11L);
        savedActivity.setTitle(activityCreateDto.title());
        savedActivity.setHost(mockHost);
        savedActivity.setDurationInHours(activityCreateDto.durationInHours());
        savedActivity.setMeetingPoint(activityCreateDto.meetingPoint());

        when(publicationRepositoryMock.save(any(Activity.class))).thenReturn(savedActivity);

        // 2. Act
        PublicationDetailDTO resultDTO = publicationService.createActivity(activityCreateDto, hostEmail);

        // 3. Assert
        assertThat(resultDTO).isNotNull();
        assertThat(resultDTO.id()).isEqualTo(11L);

        verify(userRepositoryMock).findByEmail(hostEmail);
        verify(publicationRepositoryMock).save(any(Activity.class));
    }

    @Test
    void whenCreateCoworking_shouldReturnCreatedCoworkingDTO() {
        // 1. Arrange
        when(userRepositoryMock.findByEmail(hostEmail)).thenReturn(Optional.of(mockHost));

        Coworking savedCoworking = new Coworking();
        savedCoworking.setId(12L);
        savedCoworking.setTitle(coworkingCreateDto.title());
        savedCoworking.setHost(mockHost);
        savedCoworking.setPricePerDay(coworkingCreateDto.pricePerDay());
        savedCoworking.setServices(coworkingCreateDto.services());

        when(publicationRepositoryMock.save(any(Coworking.class))).thenReturn(savedCoworking);

        // 2. Act
        PublicationDetailDTO resultDTO = publicationService.createCoworking(coworkingCreateDto, hostEmail);

        // 3. Assert
        assertThat(resultDTO).isNotNull();
        assertThat(resultDTO.id()).isEqualTo(12L);

        verify(userRepositoryMock).findByEmail(hostEmail);
        verify(publicationRepositoryMock).save(any(Coworking.class));
    }

    @Test
    void whenCreateRestaurant_shouldReturnCreatedRestaurantDTO() {
        // 1. Arrange
        when(userRepositoryMock.findByEmail(hostEmail)).thenReturn(Optional.of(mockHost));

        Restaurant savedRestaurant = new Restaurant();
        savedRestaurant.setId(13L);
        savedRestaurant.setTitle(restaurantCreateDto.title());
        savedRestaurant.setHost(mockHost);
        savedRestaurant.setCuisineType(restaurantCreateDto.cuisineType());
        savedRestaurant.setMenuUrl(restaurantCreateDto.menuUrl());

        when(publicationRepositoryMock.save(any(Restaurant.class))).thenReturn(savedRestaurant);

        // 2. Act
        PublicationDetailDTO resultDTO = publicationService.createRestaurant(restaurantCreateDto, hostEmail);

        // 3. Assert
        assertThat(resultDTO).isNotNull();
        assertThat(resultDTO.id()).isEqualTo(13L);

        verify(userRepositoryMock).findByEmail(hostEmail);
        verify(publicationRepositoryMock).save(any(Restaurant.class));
    }

    // --- ¡¡NUEVO!! Tests de ELIMINACIÓN (DELETE) ---

    @Test
    void whenDeletePublication_asOwner_shouldDeletePublication() {
        // 1. Arrange
        // El testHotel (ID 1L) está asociado al mockHost (email "host@test.com")
        when(publicationRepositoryMock.findById(1L)).thenReturn(Optional.of(testHotel));

        // 2. Act
        publicationService.deletePublication(1L, hostEmail);

        // 3. Assert
        // Verificamos que se haya llamado al método delete CON el objeto testHotel
        verify(publicationRepositoryMock).findById(1L);
        verify(publicationRepositoryMock).delete(testHotel);
    }

    @Test
    void whenDeletePublication_asWrongUser_shouldThrowException() {
        // 1. Arrange
        // El testHotel (ID 1L) está asociado al mockHost (email "host@test.com")
        when(publicationRepositoryMock.findById(1L)).thenReturn(Optional.of(testHotel));

        String wrongEmail = "attacker@gmail.com";

        // 2. Act & 3. Assert
        assertThatThrownBy(() -> {
            publicationService.deletePublication(1L, wrongEmail);
        })
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No tenés permisos");

        // Verificamos que NUNCA se llamó al método delete
        verify(publicationRepositoryMock).findById(1L);
        verify(publicationRepositoryMock, never()).delete(any(Publication.class));
    }

    @Test
    void whenDeletePublication_withInvalidId_shouldThrowException() {
        // 1. Arrange
        // Simulamos que el ID 99L no existe
        when(publicationRepositoryMock.findById(99L)).thenReturn(Optional.empty());

        // 2. Act & 3. Assert
        assertThatThrownBy(() -> {
            publicationService.deletePublication(99L, hostEmail);
        })
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Publicación no encontrada");

        // Verificamos que NUNCA se llamó al método delete
        verify(publicationRepositoryMock).findById(99L);
        verify(publicationRepositoryMock, never()).delete(any(Publication.class));
    }

}