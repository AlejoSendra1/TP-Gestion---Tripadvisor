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
import org.springframework.http.HttpStatus; // Para el 201 CREATED
import org.springframework.security.core.annotation.AuthenticationPrincipal; // La "magia"
import org.springframework.web.bind.annotation.PostMapping; // Nueva anotación
import org.springframework.web.bind.annotation.RequestBody; // Para el JSON

// ¡¡DTOs para las nuevas entidades!!
import ar.uba.fi.gestion.trippy.publication.dto.HotelCreateDTO; // El que ya tenías
import ar.uba.fi.gestion.trippy.publication.dto.ActivityCreateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.CoworkingCreateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.RestaurantCreateDTO; // <-- NUEVO


import ar.uba.fi.gestion.trippy.publication.dto.CoworkingUpdateDTO; // <-- ¡Tu DTO!
import ar.uba.fi.gestion.trippy.publication.dto.ActivityUpdateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.HotelUpdateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.RestaurantUpdateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationUpdateDTO;

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

    // --- ENDPOINTS DE CREACIÓN (POST) ---

    /**
     * (US #23) Endpoint para crear una nueva publicación de tipo "Hotel".
     * Protegido por SecurityConfig para aceptar solo rol "HOST".
     */
    @PostMapping("/hotel")
    public ResponseEntity<PublicationDetailDTO> createNewHotel(
            @RequestBody HotelCreateDTO hotelRequest,
            @AuthenticationPrincipal JwtUserDetails authenticatedUser
    ) {
        String hostEmail = authenticatedUser.username();
        PublicationDetailDTO newPublication = publicationService.createHotel(hotelRequest, hostEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPublication);
    }

    /**
     * (US #26) Endpoint para crear una nueva publicación de tipo "Activity".
     */
    @PostMapping("/activity")
    public ResponseEntity<PublicationDetailDTO> createNewActivity(
            @RequestBody ActivityCreateDTO activityRequest,
            @AuthenticationPrincipal JwtUserDetails authenticatedUser
    ) {
        String hostEmail = authenticatedUser.username();
        PublicationDetailDTO newPublication = publicationService.createActivity(activityRequest, hostEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPublication);
    }

    /**
     * (US #25) Endpoint para crear una nueva publicación de tipo "Coworking".
     */
    @PostMapping("/coworking")
    public ResponseEntity<PublicationDetailDTO> createNewCoworking(
            @RequestBody CoworkingCreateDTO coworkingRequest,
            @AuthenticationPrincipal JwtUserDetails authenticatedUser
    ) {
        String hostEmail = authenticatedUser.username();
        PublicationDetailDTO newPublication = publicationService.createCoworking(coworkingRequest, hostEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPublication);
    }

    /**
     * (US #24) Endpoint para crear una nueva publicación de tipo "Restaurant".
     */
    @PostMapping("/restaurant")
    public ResponseEntity<PublicationDetailDTO> createNewRestaurant(
            @RequestBody RestaurantCreateDTO restaurantRequest,
            @AuthenticationPrincipal JwtUserDetails authenticatedUser
    ) {
        String hostEmail = authenticatedUser.username();
        PublicationDetailDTO newPublication = publicationService.createRestaurant(restaurantRequest, hostEmail);
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




//UPDATE 


    @PatchMapping("/{id}")
    public ResponseEntity<PublicationDetailDTO> patchCommon(
            @PathVariable Long id,
            @RequestBody PublicationUpdateDTO dto,
            @AuthenticationPrincipal JwtUserDetails me

    ) {
        return ResponseEntity.ok(publicationService.updateCommonFields(id, dto, me.username()));
    }

    @PatchMapping("/hotel/{id}")
    public ResponseEntity<PublicationDetailDTO> patchHotel(
            @PathVariable Long id,
            @RequestBody HotelUpdateDTO dto,
            @AuthenticationPrincipal JwtUserDetails me

    ) {
        return ResponseEntity.ok(publicationService.updateHotelFields(id, dto, me.username()));
    }

    @PatchMapping("/activity/{id}")
    public ResponseEntity<PublicationDetailDTO> patchActivity(
            @PathVariable Long id,

            @RequestBody ActivityUpdateDTO dto,
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        return ResponseEntity.ok(publicationService.updateActivityFields(id, dto, me.username()));
    }


    @PatchMapping("/coworking/{id}")
    public ResponseEntity<PublicationDetailDTO> patchCoworking(
            @PathVariable Long id,
            @RequestBody CoworkingUpdateDTO dto,
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        return ResponseEntity.ok(publicationService.updateCoworkingFields(id, dto, me.username()));
    }



    @PatchMapping("/restaurant/{id}")
    public ResponseEntity<PublicationDetailDTO> patchRestaurant(
            @PathVariable Long id,
            @RequestBody RestaurantUpdateDTO dto,
            @AuthenticationPrincipal JwtUserDetails me
    ) {
        return ResponseEntity.ok(publicationService.updateRestaurantFields(id, dto, me.username()));
    }
}
