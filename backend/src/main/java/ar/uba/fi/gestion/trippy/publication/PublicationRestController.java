package ar.uba.fi.gestion.trippy.publication;

import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/publications")
public class PublicationRestController {

    private final PublicationService publicationService;

    @Autowired
    public PublicationRestController(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    // Endpoint para US #43
    @GetMapping
    public ResponseEntity<List<PublicationListDTO>> getAllPublications() {
        List<PublicationListDTO> publications = publicationService.getAllPublications();
        return ResponseEntity.ok(publications);
    }

    // Endpoint para US #11
    @GetMapping("/{id}")
    public ResponseEntity<PublicationDetailDTO> getPublicationById(@PathVariable Long id) {
        // El servicio puede lanzar EntityNotFoundException
        PublicationDetailDTO publication = publicationService.getPublicationById(id);
        return ResponseEntity.ok(publication);
    }
    /**
     * Captura la excepción del servicio y la convierte en una
     * respuesta HTTP 404 (Not Found) limpia.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }

}