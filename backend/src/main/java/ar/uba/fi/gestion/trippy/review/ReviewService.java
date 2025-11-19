package ar.uba.fi.gestion.trippy.review;

import ar.uba.fi.gestion.trippy.review.dto.ReviewResponseDTO;
import ar.uba.fi.gestion.trippy.user.Traveler;
import jakarta.persistence.EntityNotFoundException;
import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.publication.PublicationService;
import ar.uba.fi.gestion.trippy.review.dto.CreateReviewDTO;
import ar.uba.fi.gestion.trippy.user.UserService;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PublicationService publicationService;
    private final UserService userService;
    private final UserRepository userRepository;

    // Constantes para el sistema de XP
    private static final int BASE_XP_PER_REVIEW = 50;
    private static final int PHOTO_BONUS_XP = 25;
    private static final int LENGTH_BONUS_XP = 25;
    private static final int HIGH_RATING_BONUS_XP = 10;
    private static final int MIN_LENGTH_FOR_BONUS = 200;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, 
                        PublicationService publicationService, 
                        UserService userService,
                        UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.publicationService = publicationService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    public ReviewResponseDTO createReview(CreateReviewDTO data) {
        // Fetch the publication
        Publication publication = publicationService.getPublicationById_(data.publicationId());

        // Fetch the user
        Traveler user = (Traveler) userService.getUserByEmail(data.getReviewerEmail());

        // if user already reviewed this publication - shouldn't be able to submit
        if (reviewRepository.existsByPublicationAndReviewer(publication, user)) {
            throw new EntityNotFoundException("You already reviewed this publication");
        }

        // Create the review entity
        Review review = new Review(
                publication,
                user,
                data.rating(),
                data.reviewContent()
        );

        Review savedReview = reviewRepository.save(review);

        // *** NUEVA FUNCIONALIDAD: Otorgar XP al Traveler ***
        awardXpForReview(user, data);

        return mapToResponseDTO(savedReview);
    }

    /**
     * Calcula y otorga XP al usuario por crear una reseña
     * El XP se calcula basándose en:
     * - XP base: 50 puntos
     * - Bonus por fotos: 25 puntos (si incluye fotos)
     * - Bonus por longitud: 25 puntos (si tiene más de 200 caracteres)
     * - Bonus por calificación alta: 10 puntos (si rating >= 4)
     */
    private void awardXpForReview(Traveler traveler, CreateReviewDTO reviewData) {
        int totalXp = BASE_XP_PER_REVIEW;
        
        // Bonus por fotos (si el DTO incluye esta información)
        // Nota: Asumiendo que CreateReviewDTO tiene un método para verificar fotos
        // Si no lo tiene, puedes remover esta línea o adaptar según tu implementación
        // if (reviewData.hasPhotos()) {
        //     totalXp += PHOTO_BONUS_XP;
        // }
        
        // Bonus por longitud del contenido
        if (reviewData.reviewContent() != null && 
            reviewData.reviewContent().length() >= MIN_LENGTH_FOR_BONUS) {
            totalXp += LENGTH_BONUS_XP;
        }
        
        // Bonus por calificación alta
        if (reviewData.rating() >= 4) {
            totalXp += HIGH_RATING_BONUS_XP;
        }
        
        // Guardar el nivel anterior para detectar subida de nivel
        int oldLevel = traveler.getLevel();
        
        // Añadir XP al traveler
        traveler.addXp(totalXp);
        
        // Guardar los cambios en la base de datos
        userRepository.save(traveler);
        
        // Log para seguimiento (opcional)
        System.out.println("XP otorgado a " + traveler.getEmail() + ": " + totalXp + " puntos");
        
        // Verificar si subió de nivel
        int newLevel = traveler.getLevel();
        if (newLevel > oldLevel) {
            System.out.println("¡Felicitaciones! " + traveler.getFirstName() + 
                             " subió al nivel " + newLevel + "!");
            System.out.println("Nuevos beneficios: " + traveler.getLevelBenefits());
            // Aquí podrías:
            // - Enviar una notificación al usuario
            // - Enviar un email de felicitación
            // - Registrar el evento en un log de auditoría
            // - Actualizar badges/logros
        }
    }

    private ReviewResponseDTO mapToResponseDTO(Review review) {
        return new ReviewResponseDTO(
                review.getReviewer().getFirstName(),
                review.getReviewer().getLastName(),
                review.getReviewer().getEmail(),
                review.getPublicationRating(),
                review.getReviewContent(),
                review.getCreatedAt()
        );
    }

    public Page<ReviewResponseDTO> getReviewsByPublicationId(Long publicationId, @Valid Pageable pageable) {
        return reviewRepository.findByPublicationId(publicationId, pageable)
                .map(this::mapToResponseDTO);
    }

    public void deleteReview(Long publicationId, String reviewerEmail) {
        Publication publication = publicationService.getPublicationById_(publicationId);
        Traveler reviewer = (Traveler) userService.getUserByEmail(reviewerEmail);

        Review review = reviewRepository.findByPublicationAndReviewer(publication, reviewer)
                .orElseThrow(() -> new RuntimeException(
                        "Review not found for publication " + publicationId + " and user " + reviewerEmail));

        reviewRepository.delete(review);
        
        // Opcional: Podrías implementar también quitar XP al borrar una reseña
        // removeXpForDeletedReview(reviewer);
    }

    /**
     * Método opcional: Restar XP cuando se elimina una reseña
     * Descomentar si quieres implementar esta funcionalidad
     */
    /*
    private void removeXpForDeletedReview(Traveler traveler) {
        int xpToRemove = BASE_XP_PER_REVIEW; // O el XP que originalmente se otorgó
        traveler.addXp(-xpToRemove); // addXp acepta valores negativos
        userRepository.save(traveler);
        System.out.println("XP removido de " + traveler.getEmail() + ": " + xpToRemove + " puntos");
    }
    */
}