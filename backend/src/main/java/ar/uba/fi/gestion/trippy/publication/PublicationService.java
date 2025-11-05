package ar.uba.fi.gestion.trippy.publication;

// --- Imports Originales ---
import ar.uba.fi.gestion.trippy.config.security.JwtUserDetails;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationDetailDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationListDTO;
import ar.uba.fi.gestion.trippy.user.BusinessOwner;
import ar.uba.fi.gestion.trippy.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.Collections;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

// --- Imports NUEVOS ---
import ar.uba.fi.gestion.trippy.publication.dto.HotelCreateDTO; // <-- ¡Tu DTO!
import ar.uba.fi.gestion.trippy.publication.dto.ActivityCreateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.CoworkingCreateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.RestaurantCreateDTO;


import ar.uba.fi.gestion.trippy.publication.dto.CoworkingUpdateDTO; // <-- ¡Tu DTO!
import ar.uba.fi.gestion.trippy.publication.dto.ActivityUpdateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.HotelUpdateDTO; // <-- NUEVO
import ar.uba.fi.gestion.trippy.publication.dto.RestaurantUpdateDTO;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationUpdateDTO;


import ar.uba.fi.gestion.trippy.user.User; // <-- Para la entidad User
import ar.uba.fi.gestion.trippy.user.UserRepository; // <-- ¡NUEVA dependencia!
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Sort;

import ar.uba.fi.gestion.trippy.publication.FiltersSpec;

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
     * Búsqueda unificada con todos los filtros
     */
    public List<PublicationListDTO> searchPublications(FiltersSpec filters) {
        // Convierte la categoría al discriminador
        String categoryDiscriminator = convertCategoryToDiscriminator(filters.category());
    
        System.out.println("Searching with category: " + filters.category() + " -> " + categoryDiscriminator);
        
        // Si category es "all" o null, pasamos null para no filtrar
        if (filters.category() != null && filters.category().equalsIgnoreCase("all")) {
            categoryDiscriminator = null;
        }
        try{
            // Usa el método existente del repository que YA FUNCIONA
            List<Publication> results = publicationRepository.searchPublications(
                filters.query(),
                categoryDiscriminator,
                filters.location(),
                filters.minPrice(),
                filters.maxPrice()
            );
            
            return results.stream()
                    .map(this::convertToListDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Error during searchPublications: " + e.getMessage());  
            return Collections.emptyList();
        }
    }

    /**
     * Convierte categorías amigables a los valores REALES de tu columna tipo_publicacion
     */
    private String convertCategoryToDiscriminator(String category) {
        if (category == null || category.trim().isEmpty()) {
            return null;
        }
        
        // ESTOS SON LOS VALORES QUE ESTÁN REALMENTE EN TU BD
        // Revisa tu tabla publication para ver qué valores tiene la columna tipo_publicacion
        switch (category.toLowerCase()) {
            case "hotels":
            case "hotel":
                return "HOTEL";  // ← El valor EXACTO de tu BD
            case "restaurants":
            case "restaurant":
                return "RESTAURANT"; // ← El valor EXACTO de tu BD
            case "activities":
            case "activity":
                return "ACTIVITY"; // ← El valor EXACTO de tu BD  
            case "coworkings":
            case "coworking":
                return "COWORKING"; // ← El valor EXACTO de tu BD
            default:
                return category.toUpperCase(); // Por si acaso
        }
    }

    /**
     * Construye el objeto Sort basado en los parámetros
     */
    private Sort buildSort(String sortBy, String sortOrder) {
        Sort.Direction direction = sortOrder.equalsIgnoreCase("asc") ? 
            Sort.Direction.ASC : Sort.Direction.DESC;
        
        switch (sortBy.toLowerCase()) {
            case "price":
                return Sort.by(direction, "price");
            case "title":
                return Sort.by(direction, "title");
            case "rating":
                // Aquí podrías ordenar por rating cuando lo implementes
                return Sort.by(direction, "title"); // Por ahora, fallback a título
            default:
                return Sort.by(Sort.Direction.DESC, "title");
        }
    }

    // public List<PublicationDetailDTO> searchPublications(
    //     String q,
    //     String category,
    //     String location,
    //     BigDecimal minPrice,
    //     BigDecimal maxPrice
    // ) {
    //     return publicationRepository.searchPublications(
    //             q, category, location, minPrice, maxPrice
    //     ).stream()
    //      .map(this::convertToDetailDTO)
    //      .collect(Collectors.toList());
    //}

    public List<PublicationListDTO> findByTitle(String title) {
        List<Publication> result = publicationRepository.findByTitleContainingIgnoreCase(title);
        System.out.println("\n\n\n\nFound " + result.size() + " publications with title containing: " + title);
        return result.stream()
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
    public PublicationDetailDTO createHotel(HotelCreateDTO dto, String hostEmail) {

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
        newHotel.setHost((BusinessOwner) hostUser);

        // 6. Guardar en la DB
        Hotel savedHotel = publicationRepository.save(newHotel);

        // 7. Devolver el DTO de detalle (reutilizando la lógica existente)
        return convertToDetailDTO(savedHotel);
    }

    /**
     * (Para US #26)
     * Crea una nueva publicación de tipo Activity (Experiencia).
     * @param dto Los datos de la nueva actividad
     * @param hostEmail El email del usuario (desde el token)
     * @return El DTO de detalle de la publicación recién creada.
     */
    @Transactional
    public PublicationDetailDTO createActivity(ActivityCreateDTO dto, String hostEmail) {

        // 1. Buscar al Anfitrión (Host)
        User hostUser = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new EntityNotFoundException("Host no encontrado con email: " + hostEmail));

        // 2. Crear la entidad Activity
        Activity newActivity = new Activity();

        // 3. Mapear campos comunes
        newActivity.setTitle(dto.title());
        newActivity.setDescription(dto.description());
        newActivity.setPrice(dto.price());
        newActivity.setLocation(dto.location());
        newActivity.setMainImageUrl(dto.mainImageUrl());
        newActivity.setImageUrls(dto.imageUrls() != null ? dto.imageUrls() : Collections.emptyList());

        // 4. Mapear campos específicos (de Activity.java)
        newActivity.setDurationInHours(dto.durationInHours());
        newActivity.setMeetingPoint(dto.meetingPoint());
        newActivity.setWhatIsIncluded(dto.whatIsIncluded());
        newActivity.setActivityLevel(dto.activityLevel());
        newActivity.setLanguage(dto.language());

        // 5. Asignar el Host
        newActivity.setHost((BusinessOwner) hostUser);

        // 6. Guardar en la DB
        Activity savedActivity = publicationRepository.save(newActivity);

        // 7. Devolver el DTO de detalle
        return convertToDetailDTO(savedActivity);
    }

    /**
     * (Para US #25)
     * Crea una nueva publicación de tipo Coworking.
     * @param dto Los datos del nuevo coworking
     * @param hostEmail El email del usuario (desde el token)
     * @return El DTO de detalle de la publicación recién creada.
     */
    @Transactional
    public PublicationDetailDTO createCoworking(CoworkingCreateDTO dto, String hostEmail) {

        // 1. Buscar al Anfitrión (Host)
        User hostUser = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new EntityNotFoundException("Host no encontrado con email: " + hostEmail));

        // 2. Crear la entidad Coworking
        Coworking newCoworking = new Coworking();

        // 3. Mapear campos comunes
        newCoworking.setTitle(dto.title());
        newCoworking.setDescription(dto.description());
        newCoworking.setPrice(dto.price()); // Precio base
        newCoworking.setLocation(dto.location());
        newCoworking.setMainImageUrl(dto.mainImageUrl());
        newCoworking.setImageUrls(dto.imageUrls() != null ? dto.imageUrls() : Collections.emptyList());

        // 4. Mapear campos específicos (de Coworking.java)
        newCoworking.setPricePerDay(dto.pricePerDay());
        newCoworking.setPricePerMonth(dto.pricePerMonth());
        newCoworking.setServices(dto.services() != null ? dto.services() : Collections.emptyList());

        // 5. Asignar el Host
        newCoworking.setHost((BusinessOwner) hostUser);

        // 6. Guardar en la DB
        Coworking savedCoworking = publicationRepository.save(newCoworking);

        // 7. Devolver el DTO de detalle
        return convertToDetailDTO(savedCoworking);
    }

    /**
     * (Para US #24)
     * Crea una nueva publicación de tipo Restaurant.
     * @param dto Los datos del nuevo restaurant
     * @param hostEmail El email del usuario (desde el token)
     * @return El DTO de detalle de la publicación recién creada.
     */
    @Transactional
    public PublicationDetailDTO createRestaurant(RestaurantCreateDTO dto, String hostEmail) {

        // 1. Buscar al Anfitrión (Host)
        User hostUser = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new EntityNotFoundException("Host no encontrado con email: " + hostEmail));

        // 2. Crear la entidad Restaurant
        Restaurant newRestaurant = new Restaurant();

        // 3. Mapear campos comunes
        newRestaurant.setTitle(dto.title());
        newRestaurant.setDescription(dto.description());
        newRestaurant.setPrice(dto.price()); // Precio base
        newRestaurant.setLocation(dto.location());
        newRestaurant.setMainImageUrl(dto.mainImageUrl());
        newRestaurant.setImageUrls(dto.imageUrls() != null ? dto.imageUrls() : Collections.emptyList());

        // 4. Mapear campos específicos (de Restaurant.java)
        newRestaurant.setCuisineType(dto.cuisineType());
        newRestaurant.setPriceRange(dto.priceRange());
        newRestaurant.setOpeningHours(dto.openingHours());
        newRestaurant.setMenuUrl(dto.menuUrl());

        // 5. Asignar el Host
        newRestaurant.setHost((BusinessOwner) hostUser);

        // 6. Guardar en la DB
        Restaurant savedRestaurant = publicationRepository.save(newRestaurant);

        // 7. Devolver el DTO de detalle
        return convertToDetailDTO(savedRestaurant);
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
            BusinessOwner host = p.getHost();
            hostDTO = new PublicationDetailDTO.HostDTO(host.getId(), host.getBusinessName(), host.getEmail(),null); // Foto no disponible en User.java
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


// update

    @Transactional
    public PublicationDetailDTO updateCommonFields(Long id, PublicationUpdateDTO dto, String email) {
        Publication p = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + id));

        if (p.getHost() == null || !p.getHost().getEmail().equals(email))
            throw new IllegalStateException("No tenés permisos para modificar esta publicación.");

        if (dto.title() != null)        p.setTitle(dto.title());
        if (dto.description() != null)  p.setDescription(dto.description());
        if (dto.price() != null)        p.setPrice(dto.price());
        if (dto.location() != null)     p.setLocation(dto.location());
        if (dto.mainImageUrl() != null) p.setMainImageUrl(dto.mainImageUrl());
        if (dto.imageUrls() != null)    p.setImageUrls(dto.imageUrls());

        return convertToDetailDTO(publicationRepository.save(p));
    }



    @Transactional
    public PublicationDetailDTO updateHotelFields(Long id, HotelUpdateDTO dto, String email) {
        Publication base = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + id));
        if (base.getHost() == null || !base.getHost().getEmail().equals(email))
            throw new IllegalStateException("No tenés permisos para modificar esta publicación.");
        if (!(base instanceof Hotel h))
            throw new IllegalStateException("El ID no corresponde a un Hotel.");

        if (dto.roomCount() != null) h.setRoomCount(dto.roomCount());
        if (dto.capacity()   != null) h.setCapacity(dto.capacity());
        return convertToDetailDTO(publicationRepository.save(h));
    }

    @Transactional
    public PublicationDetailDTO updateActivityFields(Long id, ActivityUpdateDTO dto, String email) {
        Publication base = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + id));
        if (base.getHost() == null || !base.getHost().getEmail().equals(email))
            throw new IllegalStateException("No tenés permisos para modificar esta publicación.");
        if (!(base instanceof Activity a))
            throw new IllegalStateException("El ID no corresponde a una Activity.");
        if (dto.durationInHours() != null) a.setDurationInHours(dto.durationInHours());
        if (dto.meetingPoint()    != null) a.setMeetingPoint(dto.meetingPoint());
        if (dto.whatIsIncluded()  != null) a.setWhatIsIncluded(dto.whatIsIncluded());
        if (dto.activityLevel()   != null) a.setActivityLevel(dto.activityLevel());
        if (dto.language()        != null) a.setLanguage(dto.language());

        return convertToDetailDTO(publicationRepository.save(a));
    }



    @Transactional
    public PublicationDetailDTO updateCoworkingFields(Long id, CoworkingUpdateDTO dto, String email) {
        Publication base = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + id));

        System.out.println("DEBUG tipo entidad con ID " + id + ": " + base.getClass().getSimpleName());

        if (base.getHost() == null || !base.getHost().getEmail().equals(email))
            throw new IllegalStateException("No tenés permisos para modificar esta publicación.");
        if (!(base instanceof Coworking c))
            throw new IllegalStateException("El ID no corresponde a un Coworking.");

        if (dto.pricePerDay()   != null) c.setPricePerDay(dto.pricePerDay());
        if (dto.pricePerMonth() != null) c.setPricePerMonth(dto.pricePerMonth());
        if (dto.services()      != null) c.setServices(dto.services());

        return convertToDetailDTO(publicationRepository.save(c));
    }

    @Transactional
    public PublicationDetailDTO updateRestaurantFields(Long id, RestaurantUpdateDTO dto, String email) {
        Publication base = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + id));
        if (base.getHost() == null || !base.getHost().getEmail().equals(email))
            throw new IllegalStateException("No tenés permisos para modificar esta publicación.");
        if (!(base instanceof Restaurant r))
            throw new IllegalStateException("El ID no corresponde a un Restaurant.");

        if (dto.cuisineType() != null)  r.setCuisineType(dto.cuisineType());
        if (dto.priceRange()  != null)  r.setPriceRange(dto.priceRange());
        if (dto.openingHours()!= null)  r.setOpeningHours(dto.openingHours());
        if (dto.menuUrl()     != null)  r.setMenuUrl(dto.menuUrl());

        return convertToDetailDTO(publicationRepository.save(r));
    }

    @Transactional // ¡MUY importante!
    public void deletePublication(Long id, String hostEmail) {

        // 1. Buscar la publicación
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + id));

        // 2. Validación de permisos (¡CRÍTICO!)
        if (publication.getHost() == null || !publication.getHost().getEmail().equals(hostEmail)) {
            // Usamos IllegalStateException o AccessDeniedException
            throw new IllegalStateException("No tenés permisos para eliminar esta publicación.");
        }

        // 3. (VER PRÓXIMA SECCIÓN) Aquí debería ir la validación de reservas activas

        // 4. Eliminar la publicación
        publicationRepository.delete(publication);
    }

}