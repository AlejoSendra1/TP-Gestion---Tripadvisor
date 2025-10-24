package ar.uba.fi.gestion.trippy.publication;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor; // Para capturar el objeto guardado
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ar.uba.fi.gestion.trippy.common.location.Location;
import ar.uba.fi.gestion.trippy.publication.dto.CreateHotelDTO; // ¡Importamos tu DTO!
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository; // ¡Importamos el repo de User!

import jakarta.persistence.EntityNotFoundException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PublicationServiceTest {

    @Mock
    private PublicationRepository publicationRepositoryMock;

    @Mock
    private UserRepository userRepositoryMock; // <-- 1. ¡AGREGAMOS EL MOCK QUE FALTABA!

    // @InjectMocks ya no se usa para evitar problemas de inyección
    private PublicationService publicationService;

    // Variables de prueba
    private Hotel testHotel;
    private Restaurant testRestaurant;
    private Location testLocation;
    private User testHost; // <-- Ahora será un objeto REAL para tests

    @BeforeEach
    void setUp() {
        // --- 2. INSTANCIAMOS EL SERVICIO MANUALMENTE ---
        // Ahora le pasamos AMBOS mocks al constructor
        publicationService = new PublicationService(publicationRepositoryMock, userRepositoryMock);

        // --- 3. El Host ahora es un objeto real (no mock) ---
        testHost = new User("Test", "Host", "host@test.com", "password");
        // (Simulamos que ya tiene un ID de la base de datos)
        // Necesitaremos reflection o un setter si queremos setear el ID, pero para el test
        // de createHotel no es 100% necesario. Para getById sí.

        testLocation = new Location();
        testLocation.setCity("Buenos Aires");
        testLocation.setCountry("Argentina");

        testHotel = new Hotel();
        testHotel.setId(1L);
        testHotel.setTitle("Gran Hotel Test");
        // ... (resto de campos)
        testHotel.setHost(testHost); // Le asignamos el User real

        testRestaurant = new Restaurant();
        testRestaurant.setId(2L);
        // ... (resto de campos)
        testRestaurant.setHost(testHost);
    }

    // --- (Los tests GET existentes van aquí, pero OJO) ---

    @Test
    void whenGetPublicationById_withValidId_shouldReturnDetailDTO() {
        // Arrange
        // Como 'testHost' ya no es un mock, no usamos 'when()'.
        // PERO, necesitamos simular que tiene un ID.
        // La forma más fácil es usar un mock como antes:
        User mockHost = org.mockito.Mockito.mock(User.class);
        when(mockHost.getId()).thenReturn(100L);
        when(mockHost.getFirstname()).thenReturn("Test Host");
        testHotel.setHost(mockHost); // Sobreescribimos con el mock para ESTE test

        when(publicationRepositoryMock.findById(1L)).thenReturn(Optional.of(testHotel));

        // Act
        PublicationDetailDTO resultDTO = publicationService.getPublicationById(1L);

        // Assert
        assertThat(resultDTO.host().id()).isEqualTo(100L);
        assertThat(resultDTO.host().name()).isEqualTo("Test Host");
        // ... (resto de asserts)
    }

    // --- ¡NUEVO TEST PARA US #23! ---

    @Test
    void whenCreateHotel_shouldReturnCreatedHotelDTO() {
        // 1. Arrange (Given)
        String hostEmail = "host@test.com";

        // El DTO de entrada
        CreateHotelDTO createDto = new CreateHotelDTO(
                "Nuevo Hotel", "Descripción", 200.0,
                testLocation, "http://img.com/main.png", Collections.emptyList(),
                10, 20 // roomCount y capacity
        );

        // El usuario anfitrión que el repo debe encontrar
        User foundHost = new User("Host", "Encontrado", hostEmail, "pass");
        // (Simulamos un ID)
        // Aquí SÍ necesitamos un ID para el HostDTO de respuesta.
        // Vamos a mockear el User para este test.
        User mockHost = org.mockito.Mockito.mock(User.class);
        when(mockHost.getId()).thenReturn(100L);
        when(mockHost.getFirstname()).thenReturn("Host Encontrado");

        // Cuando el servicio llame al userRepo, devolvemos el mockHost
        when(userRepositoryMock.findByEmail(hostEmail)).thenReturn(Optional.of(mockHost));

        // Para capturar el Hotel que el servicio intenta guardar
        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);

        // Creamos la entidad "guardada" que el repo devolverá
        Hotel savedHotel = new Hotel();
        savedHotel.setId(1L); // El ID que la DB le asignaría
        savedHotel.setTitle("Nuevo Hotel");
        savedHotel.setHost(mockHost); // El host asignado
        savedHotel.setRoomCount(10);
        savedHotel.setCapacity(20); // ¡Asegúrate que Hotel.java tenga este setter!

        // Cuando el servicio llame a 'save', le devolvemos el 'savedHotel'
        when(publicationRepositoryMock.save(hotelCaptor.capture())).thenReturn(savedHotel);

        // 2. Act (When)
        PublicationDetailDTO resultDTO = publicationService.createHotel(createDto, hostEmail);

        // 3. Assert (Then)
        assertThat(resultDTO).isNotNull();
        assertThat(resultDTO.id()).isEqualTo(1L);
        assertThat(resultDTO.title()).isEqualTo("Nuevo Hotel");
        assertThat(resultDTO.publicationType()).isEqualTo("Hotel");

        // Verificamos el HostDTO de la respuesta
        assertThat(resultDTO.host()).isNotNull();
        assertThat(resultDTO.host().id()).isEqualTo(100L);

        // Verificamos que el objeto capturado (el que se mandó a guardar)
        // tenga los datos correctos
        Hotel capturedHotel = hotelCaptor.getValue();
        assertThat(capturedHotel.getTitle()).isEqualTo("Nuevo Hotel");
        assertThat(capturedHotel.getHost().getFirstname()).isEqualTo("Host Encontrado");

        // Verificamos que los mocks fueron llamados
        verify(userRepositoryMock).findByEmail(hostEmail);
        verify(publicationRepositoryMock).save(any(Hotel.class));
    }

    // ... (resto de tests GET y el de EntityNotFoundException)
}