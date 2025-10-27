package ar.uba.fi.gestion.trippy.publication;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ar.uba.fi.gestion.trippy.common.location.Location;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import ar.uba.fi.gestion.trippy.user.User; // Importamos la clase User

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


/**
 * Anotación clave para que JUnit 5 "entienda" las anotaciones de Mockito
 * como @Mock y @InjectMocks.
 */
@ExtendWith(MockitoExtension.class)
public class PublicationServiceTest {

    /**
     * @Mock: Crea una versión "falsa" (un mock) del Repositorio.
     */
    @Mock
    private PublicationRepository publicationRepositoryMock;

    /**
     * @Mock: ¡LA CLAVE DE LA OPCIÓN 3!
     * También creamos un "falso" User. No es un objeto real,
     * solo un mock que simulará ser un anfitrión.
     */
    @Mock
    private User testHost; // <-- ¡Es un Mock!

    /**
     * @InjectMocks: Crea una instancia real de PublicationService
     * e "inyecta" los mocks de arriba (el repo y el user).
     * (Nota: Inyectará el repo, pero no el user, ya que el user
     * no es un campo del servicio, sino que vendrá "dentro"
     * de las publicaciones).
     */
    @InjectMocks
    private PublicationService publicationService;

    // Variables de prueba (Objetos reales que no son dependencias)
    private Hotel testHotel;
    private Restaurant testRestaurant;
    private Location testLocation;
    // 'testHost' ya está declarado arriba como @Mock

    /**
     * @BeforeEach: Este método se ejecuta antes de CADA test.
     */
    @BeforeEach
    void setUp() {
        // --- 1. Programamos el Mock del Host ---
        // Le decimos al mock qué debe devolver CUANDO se llamen sus métodos.
        // El servicio llamará a .getId() y .getName() para armar el HostDTO.
//        when(testHost.getId()).thenReturn(100L);
//        when(testHost.getName()).thenReturn("Test Host");
        // No necesitamos mockear getPhotoUrl() porque el servicio lo maneja.

        // 2. Creamos una Location de prueba (objeto real)
        testLocation = new Location();
        testLocation.setCity("Buenos Aires");
        testLocation.setCountry("Argentina");

        // 3. Creamos un Hotel de prueba (objeto real)
        testHotel = new Hotel();
        testHotel.setId(1L);
        testHotel.setTitle("Gran Hotel Test");
        testHotel.setPrice(150.0);
        testHotel.setLocation(testLocation);
        testHotel.setMainImageUrl("http://hotel.com/img.png");
        testHotel.setRoomCount(50); // Dato específico de Hotel
        // ¡Le asignamos el User MOCKEADO!
        testHotel.setHost(testHost);

        // 4. Creamos un Restaurante de prueba (objeto real)
        testRestaurant = new Restaurant();
        testRestaurant.setId(2L);
        testRestaurant.setTitle("Restaurante Test");
        testRestaurant.setPrice(40.0);
        testRestaurant.setLocation(testLocation);
        testRestaurant.setMainImageUrl("http://resto.com/img.png");
        testRestaurant.setCuisineType("Italiana"); // Dato específico de Restaurant
        // ¡Le asignamos el User MOCKEADO!
        testRestaurant.setHost(testHost);
    }

    /**
     * Prueba para el método getAllPublications (US #43)
     */
    @Test
    void whenGetAllPublications_shouldReturnPublicationListDTOs() {
        // --- 1. Arrange (Given) ---
        // Le decimos al mock del Repositorio qué devolver
        List<Publication> mockPublicationList = List.of(testHotel, testRestaurant);
        when(publicationRepositoryMock.findAll()).thenReturn(mockPublicationList);

        // --- 2. Act (When) ---
        List<PublicationListDTO> resultDTOs = publicationService.getAllPublications();

        // --- 3. Assert (Then) ---
        assertThat(resultDTOs).isNotNull();
        assertThat(resultDTOs).hasSize(2);

        assertThat(resultDTOs.get(0).id()).isEqualTo(1L);
        assertThat(resultDTOs.get(0).title()).isEqualTo("Gran Hotel Test");
        assertThat(resultDTOs.get(0).city()).isEqualTo("Buenos Aires");
        assertThat(resultDTOs.get(0).publicationType()).isEqualTo("Hotel");

        assertThat(resultDTOs.get(1).id()).isEqualTo(2L);
        assertThat(resultDTOs.get(1).publicationType()).isEqualTo("Restaurant");

        verify(publicationRepositoryMock).findAll();
    }

    /**
     * Prueba para getPublicationById (US #11) - Caso Éxito
     */
    @Test
    void whenGetPublicationById_withValidId_shouldReturnDetailDTO() {
        // --- 1. Arrange (Given) ---
        when(testHost.getId()).thenReturn(100L);
        when(testHost.getFirstname()).thenReturn("Test Host");
        when(publicationRepositoryMock.findById(1L)).thenReturn(Optional.of(testHotel));

        // --- 2. Act (When) ---
        PublicationDetailDTO resultDTO = publicationService.getPublicationById(1L);

        // --- 3. Assert (Then) ---
        assertThat(resultDTO).isNotNull();
        assertThat(resultDTO.id()).isEqualTo(1L);
        assertThat(resultDTO.title()).isEqualTo("Gran Hotel Test");
        assertThat(resultDTO.publicationType()).isEqualTo("Hotel");

        // Verificamos el DTO anidado (HostDTO)
        // El servicio usó los valores que programamos en el mock 'testHost'
        assertThat(resultDTO.host()).isNotNull();
        assertThat(resultDTO.host().id()).isEqualTo(100L);
        assertThat(resultDTO.host().name()).isEqualTo("Test Host");
        assertThat(resultDTO.host().photoUrl()).isNull();

        // Verificamos los detalles específicos
        assertThat(resultDTO.specificDetails()).isNotNull();
        assertThat(resultDTO.specificDetails().get("roomCount")).isEqualTo(50);

        verify(publicationRepositoryMock).findById(1L);
    }

    /**
     * Prueba para getPublicationById (US #11) - Caso Falla (No Encontrado)
     */
    @Test
    void whenGetPublicationById_withInvalidId_shouldThrowEntityNotFoundException() {
        // --- 1. Arrange (Given) ---
        Long invalidId = 99L;
        when(publicationRepositoryMock.findById(invalidId)).thenReturn(Optional.empty());

        // --- 2. Act & 3. Assert (When & Then) ---
        // Verificamos que se lanza la excepción correcta
        assertThatExceptionOfType(EntityNotFoundException.class)
                .isThrownBy(() -> {
                    publicationService.getPublicationById(invalidId);
                })
                .withMessage("Publicación no encontrada con ID: " + invalidId);

        verify(publicationRepositoryMock).findById(invalidId);
    }
}