package ar.uba.fi.gestion.trippy.publication;

// --- Imports Originales ---
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// --- Imports NUEVOS ---
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails; // Para el @AuthenticationPrincipal
import ar.uba.fi.gestion.trippy.publication.dto.CreateHotelDTO; // El DTO de entrada
import org.springframework.http.HttpStatus; // Para el 201 CREATED
import org.springframework.security.core.annotation.AuthenticationPrincipal; // La "magia"
import org.springframework.web.bind.annotation.PostMapping; // Nueva anotación
import org.springframework.web.bind.annotation.RequestBody; // Para el JSON

@RestController
@RequestMapping("/publications")
public class PublicationRestController {

    private final PublicationService publicationService;

    @Autowired
    public PublicationRestController(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    // Endpoint para US #43 (El que ya tenías)
    @GetMapping
    public ResponseEntity<List<PublicationListDTO>> getAllPublications() {
        List<PublicationListDTO> publications = publicationService.getAllPublications();
        return ResponseEntity.ok(publications);
    }

    // Endpoint para US #11 (El que ya tenías)
    @GetMapping("/{id}")
    public ResponseEntity<PublicationDetailDTO> getPublicationById(@PathVariable Long id) {
        // El servicio puede lanzar EntityNotFoundException
        PublicationDetailDTO publication = publicationService.getPublicationById(id);
        return ResponseEntity.ok(publication);
    }

    // --- NUEVO ENDPOINT PARA US #23 ---

    /**
     * Endpoint para crear una nueva publicación de tipo "Hotel".
     * Protegido por SecurityConfig para aceptar solo rol "HOST".
     */
    @PostMapping("/hotel")
    public ResponseEntity<PublicationDetailDTO> createNewHotel(
            @RequestBody CreateHotelDTO hotelRequest, // 1. Recibe el JSON con los datos del hotel
            @AuthenticationPrincipal JwtUserDetails authenticatedUser // 2. Recibe el Principal (JwtUserDetails)
    ) {
        // 3. Como tu JwtAuthFilter pone JwtUserDetails en el contexto,
        //    podemos obtener el email (username)
        String hostEmail = authenticatedUser.username();

        // 4. Llamamos al servicio (que modificaremos después)
        PublicationDetailDTO newPublication = publicationService.createHotel(hotelRequest, hostEmail);

        // 5. Retornamos 201 Created y la publicación recién creada
        return ResponseEntity.status(HttpStatus.CREATED).body(newPublication);
    }


    /**
     * Captura la excepción del servicio y la convierte en una
     * respuesta HTTP 404 (Not Found) limpia. (Ya lo tenías)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}