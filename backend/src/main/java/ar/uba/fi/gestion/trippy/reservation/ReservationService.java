package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.publication.PublicationService;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationResponseDTO;
import ar.uba.fi.gestion.trippy.user.Traveler;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserRepository;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.user.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;
    private final ReservationFactory reservationFactory;

    // Constantes para el sistema de XP por reserva
    private static final int BASE_XP_PER_RESERVATION = 100;
    private static final int XP_PER_10_DOLLARS = 1;  // 1 XP por cada $10

    @Autowired
    private PublicationService publicationService;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
                              PublicationRepository publicationRepository,
                              UserRepository userRepository,
                              ReservationFactory reservationFactory) {
        this.reservationRepository = reservationRepository;
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
        this.reservationFactory = reservationFactory;
    }

    @Transactional
    public Reservation createReservation(Long publicationId, ReservationCreateDTO dto, String userEmail) {
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + publicationId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        if (!(user instanceof Traveler traveler))
            throw new IllegalStateException("Solo Travelers pueden crear reservas.");

        if (pub.getHost() != null && pub.getHost().getEmail().equals(userEmail))
            throw new IllegalStateException("No podés reservar tu propia publicación.");

        double oldPrice = pub.getPrice();
        double newPrice = publicationService.getPublicationPriceForActualUser(publicationId);
        pub.setPrice(newPrice);
        Reservation reservation = reservationFactory.createForPublication(pub, user, dto);

        // Delegar validación a la instancia concreta antes de persistir
        reservation.validateCapacity(reservationRepository);

        Reservation savedReservation = reservationRepository.save(reservation);
        pub.setPrice(oldPrice);
        publicationRepository.save(pub);

        // ✅ NUEVO: Otorgar XP al Traveler por la reserva
        awardXpForReservation(traveler, savedReservation.getTotalPrice());

        return savedReservation;
    }

    /**
     * Calcula y otorga XP al usuario por crear una reserva.
     * El XP se calcula basándose en:
     * - XP base: 30 puntos por reserva
     * - XP por monto: 1 XP por cada $10 del precio total
     */
    private void awardXpForReservation(Traveler traveler, BigDecimal totalPrice) {
        int totalXp = BASE_XP_PER_RESERVATION;

        // Bonus por monto de la reserva
        if (totalPrice != null && totalPrice.compareTo(BigDecimal.ZERO) > 0) {
            int priceXp = totalPrice.divide(BigDecimal.TEN, 0, java.math.RoundingMode.DOWN).intValue();
            totalXp += priceXp;
        }

        // Guardar nivel anterior para detectar subida
        int oldLevel = traveler.getLevel();

        // Añadir XP
        traveler.addXp(totalXp);
        userRepository.save(traveler);

        // Log
        System.out.println("✅ XP otorgado a " + traveler.getEmail() + " por reserva: " + totalXp + " puntos");

        // Verificar si subió de nivel
        int newLevel = traveler.getLevel();
        if (newLevel > oldLevel) {
            System.out.println("🎉 ¡" + traveler.getFirstName() + " subió al nivel " + newLevel + "!");
        }
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsForTraveler(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        if (!(user instanceof Traveler traveler))
            throw new IllegalStateException("Solo los viajeros pueden tener reservas");

        return reservationRepository.findByTravelerIdWithAssociations(traveler.getId());
    }

    @Transactional
    public Reservation cancelReservation(Long publicationId, Long reservationId, String userEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada: " + reservationId));

        if (!reservation.getPublication().getId().equals(publicationId))
            throw new IllegalStateException("La reserva no pertenece a esta publicación.");

        if (!reservation.getTraveler().getEmail().equals(userEmail))
            throw new SecurityException("No tenés permiso para cancelar esta reserva.");

        reservation.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)

    public ReservationResponseDTO getReservationById(Long reservationId, String userEmail) {
        // 1. Busca la reserva
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada: " + reservationId));

        // 2. Valida permisos
        // Solo el viajero que la creó o el host de la publicación pueden verla.
        if (!reservation.getTraveler().getEmail().equals(userEmail) &&
                !reservation.getPublication().getHost().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("No tienes permiso para ver esta reserva.");
        }

        // 3. Convierte al DTO que ya tienes
        return ReservationResponseDTO.from(reservation);
    }

    /**
     * Obtiene todas las reservas de un usuario específico.
     * Al ser @Transactional, evita la LazyInitializationException.
     */
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getMyReservations(String userEmail) {

        // 1. Buscar al usuario
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        // 2. Buscar sus reservas
        List<Reservation> reservations = reservationRepository.findByTravelerId(user.getId());

        // 3. Convertir a DTOs (la sesión sigue abierta aquí)
        return reservations.stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());
    }
  
    @Transactional(readOnly = true)
    public List<Reservation> getReservationsForPublication(Long publicationId, String requestingUserEmail) {
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + publicationId));

        // política: sólo el host puede ver todas las reservas de su publicación
        if (pub.getHost() == null || !pub.getHost().getEmail().equals(requestingUserEmail)) {
            throw new SecurityException("No tenés permiso para ver las reservas de esta publicación.");
        }

        return reservationRepository.findByPublicationIdWithAssociations(publicationId);
    }
}
