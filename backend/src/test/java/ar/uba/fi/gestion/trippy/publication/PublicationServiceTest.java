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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PublicationServiceTest {

    @Mock
    private PublicationRepository publicationRepositoryMock;

    @Mock
    private BusinessOwner testHost; // <-- ¡Es un Mock!

    /**
     * @InjectMocks: Crea una instancia real de PublicationService
     * e "inyecta" los mocks de arriba (el repo y el user).
     * (Nota: Inyectará el repo, pero no el user, ya que el user
     * no es un campo del servicio, sino que vendrá "dentro"
     * de las publicaciones).
     */

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

    // --- ¡¡NUEVOS DTOs DE ENTRADA!! ---
    private HotelCreateDTO hotelCreateDto;
    private ActivityCreateDTO activityCreateDto;
    private CoworkingCreateDTO coworkingCreateDto;
    private RestaurantCreateDTO restaurantCreateDto;


    @BeforeEach
    void setUp() {
        // Instanciamos el servicio manualmente con sus mocks
        publicationService = new PublicationService(publicationRepositoryMock, userRepositoryMock);

        // --- Host Mock ---
        // Usamos un mock para el Host para poder simular su ID y nombre
        // fácilmente en las respuestas.
        mockHost = org.mockito.Mockito.mock(BusinessOwner.class);
        when(mockHost.getId()).thenReturn(100L);
        when(mockHost.getBusinessName()).thenReturn("Host Mockeado");

        testLocation = new Location();
        testLocation.setCity("Buenos Aires");
        testLocation.setCountry("Argentina");

        // --- Entidades (para tests GET) ---
        testHotel = new Hotel();
        testHotel.setId(1L);
        testHotel.setTitle("Gran Hotel Test");
        testHotel.setHost(mockHost);
        testHotel.setRoomCount(10); // Para specificDetails

        testRestaurant = new Restaurant();
        testRestaurant.setId(2L);
        testRestaurant.setHost(mockHost);

        // --- ¡¡NUEVO!! Inicializamos los DTOs de creación ---
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
        assertThat(resultDTO.title()).isEqualTo("Nueva Actividad");
        assertThat(resultDTO.publicationType()).isEqualTo("Activity");
        assertThat(resultDTO.host().id()).isEqualTo(100L);
        assertThat(resultDTO.specificDetails().get("durationInHours")).isEqualTo(3);
        assertThat(resultDTO.specificDetails().get("meetingPoint")).isEqualTo("Obelisco");

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
        assertThat(resultDTO.title()).isEqualTo("Nuevo Coworking");
        assertThat(resultDTO.publicationType()).isEqualTo("Coworking");
        assertThat(resultDTO.host().id()).isEqualTo(100L);
        assertThat(resultDTO.specificDetails().get("pricePerDay")).isEqualTo(25.0);
        assertThat(resultDTO.specificDetails().get("services")).isEqualTo(List.of("Wifi", "Café"));

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
        assertThat(resultDTO.title()).isEqualTo("Nuevo Restaurant");
        assertThat(resultDTO.publicationType()).isEqualTo("Restaurant");
        assertThat(resultDTO.host().id()).isEqualTo(100L);
        assertThat(resultDTO.specificDetails().get("cuisineType")).isEqualTo("Italiana");
        assertThat(resultDTO.specificDetails().get("menuUrl")).isEqualTo("http://menu.com");

        verify(userRepositoryMock).findByEmail(hostEmail);
        verify(publicationRepositoryMock).save(any(Restaurant.class));
    }
}