package ar.uba.fi.gestion.trippy.publication;

import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import ar.uba.fi.gestion.trippy.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true) // Por defecto, solo lectura
public class PublicationService {

    private final PublicationRepository publicationRepository;

    @Autowired
    public PublicationService(PublicationRepository publicationRepository) {
        this.publicationRepository = publicationRepository;
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

    // --- MÉTODOS PRIVADOS DE CONVERSIÓN (DTOs) ---

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

        List<String> imageGallery = new ArrayList<>(p.getImageUrls());

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