package ar.uba.fi.gestion.trippy.publication;

// --- Imports Originales ---
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

// --- Imports NUEVOS ---
import ar.uba.fi.gestion.trippy.publication.dto.CreateHotelDTO; // <-- ¡Tu DTO!
import ar.uba.fi.gestion.trippy.user.User; // <-- Para la entidad User
import ar.uba.fi.gestion.trippy.user.UserRepository; // <-- ¡NUEVA dependencia!

@Service
@Transactional(readOnly = true) // Por defecto, solo lectura
public class PublicationService {

    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository; // <-- ¡NUEVO CAMPO!

    @Autowired
    public PublicationService(
            PublicationRepository publicationRepository,
            UserRepository userRepository // <-- ¡NUEVO en el constructor!
    ) {
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository; // <-- ¡NUEVA asignación!
    }

    /**
     * (Para US #43)
     * Obtiene la lista de todas las publicaciones en un formato resumido.
     */
    public List<PublicationListDTO> getAllPublications() {
        return publicationRepository.findAll()
                .stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    /**
     * (Para US #11)
     * Obtiene la vista de detalle completa de una publicación por su ID.
     */
    public PublicationDetailDTO getPublicationById(Long id) {
        return publicationRepository.findById(id)
                .map(this::convertToDetailDTO)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada con ID: " + id));
    }

    // --- ¡NUEVO MÉTODO PARA US #23! ---

    /**
     * (Para US #23)
     * Crea una nueva publicación de tipo Hotel.
     * @param dto Los datos del nuevo hotel (desde el RequestBody)
     * @param hostEmail El email del usuario (desde el token)
     * @return El DTO de detalle de la publicación recién creada.
     */
    @Transactional // ¡Importante! Esta SÍ modifica la DB
    public PublicationDetailDTO createHotel(CreateHotelDTO dto, String hostEmail) {

        // 1. Buscar al Anfitrión (Host) por su email
        User hostUser = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new EntityNotFoundException("Host no encontrado con email: " + hostEmail));

        // 2. Crear la entidad Hotel
        Hotel newHotel = new Hotel();

        // 3. Mapear campos comunes (de Publication.java)
        newHotel.setTitle(dto.title());
        newHotel.setDescription(dto.description());
        newHotel.setPrice(dto.price());
        newHotel.setLocation(dto.location());
        newHotel.setMainImageUrl(dto.mainImageUrl());

        // Manejo de galería de imágenes (si viene nula, la inicializamos vacía)
        newHotel.setImageUrls(dto.imageUrls() != null ? dto.imageUrls() : Collections.emptyList());

        // 4. Mapear campos específicos (de Hotel.java)
        newHotel.setRoomCount(dto.roomCount());

        // ¡OJO! Asegúrate de tener este setter en tu archivo Hotel.java
        newHotel.setCapacity(dto.capacity());

        // 5. ¡Asignar el Host!
        newHotel.setHost(hostUser);

        // 6. Guardar en la DB
        Hotel savedHotel = publicationRepository.save(newHotel);

        // 7. Devolver el DTO de detalle (reutilizando la lógica existente)
        return convertToDetailDTO(savedHotel);
    }


    // --- MÉTODOS PRIVADOS DE CONVERSIÓN (DTOs) ---
    // (Sin cambios, exactamente como los tenías)

    /**
     * Helper para convertir una Entidad en un DTO de Lista.
     */
    private PublicationListDTO convertToListDTO(Publication p) {
        String city = (p.getLocation() != null) ? p.getLocation().getCity() : null;
        String country = (p.getLocation() != null) ? p.getLocation().getCountry() : null;

        return new PublicationListDTO(
                p.getId(),
                p.getTitle(),
                p.getPrice(),
                city,
                country,
                p.getMainImageUrl(),
                p.getClass().getSimpleName() // "Alojamiento", "Restaurante", etc.
        );
    }

    /**
     * Helper para convertir una Entidad en un DTO de Detalle.
     */
    private PublicationDetailDTO convertToDetailDTO(Publication p) {

        // Crea el DTO del Host
        PublicationDetailDTO.HostDTO hostDTO = null;
        if (p.getHost() != null) {
            User host = p.getHost();
            hostDTO = new PublicationDetailDTO.HostDTO(host.getId(), host.getFirstname(), null); // Foto no disponible en User.java
        }

        List<String> imageGallery = (p.getImageUrls() != null)
                ? new ArrayList<>(p.getImageUrls())
                : Collections.emptyList();

        return new PublicationDetailDTO(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getPrice(),
                p.getLocation(),
                hostDTO,
                imageGallery,
                Collections.emptyList(), // (Aún no implementamos reseñas)
                p.getClass().getSimpleName(),
                p.fetchSpecificDetails() // <-- ¡LA LLAMADA POLIMÓRFICA!
        );
    }
}