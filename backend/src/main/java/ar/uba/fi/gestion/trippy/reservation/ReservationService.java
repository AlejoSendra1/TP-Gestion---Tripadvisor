package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.publication.PublicationService;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationResponseDTO;
import ar.uba.fi.gestion.trippy.shop.Benefit;
import ar.uba.fi.gestion.trippy.shop.ShopService;
import ar.uba.fi.gestion.trippy.shop.UserBenefit;
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
    private final ShopService shopService;

    // Constantes para el sistema de XP por reserva
    private static final int BASE_XP_PER_RESERVATION = 100;
    private static final int XP_PER_10_DOLLARS = 1; // 1 XP por cada $10

    @Autowired
    private PublicationService publicationService;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository,
            PublicationRepository publicationRepository,
            UserRepository userRepository,
            ReservationFactory reservationFactory,
            ShopService shopService) {
        this.reservationRepository = reservationRepository;
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
        this.reservationFactory = reservationFactory;
        this.shopService = shopService;
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
        double finalPrice = publicationService.getPublicationPriceForActualUser(publicationId);
        pub.setPrice(finalPrice);
        Reservation reservation = reservationFactory.createForPublication(pub, user, dto);

        // Delegar validación a la instancia concreta antes de persistir
        reservation.validateCapacity(reservationRepository);

        Reservation savedReservation = reservationRepository.save(reservation);
        pub.setPrice(oldPrice);
        publicationRepository.save(pub);

        return savedReservation;
    }

    /**
     * ✅ NUEVO: Aplica descuentos de beneficios activos
     */
    private BigDecimal applyBenefitDiscounts(Traveler traveler, BigDecimal originalPrice) {
        List<UserBenefit> discountBenefits = shopService.getActiveBenefitsByType(
                traveler.getId(),
                Benefit.BenefitType.DISCOUNT);

        if (discountBenefits.isEmpty()) {
            return originalPrice;
        }

        // Usar el beneficio con mayor descuento
        UserBenefit bestDiscount = discountBenefits.stream()
                .max((b1, b2) -> Integer.compare(
                        b1.getBenefit().getDiscountPercentage(),
                        b2.getBenefit().getDiscountPercentage()))
                .orElse(null);

        if (bestDiscount != null && bestDiscount.getBenefit().getDiscountPercentage() != null) {
            int discountPercent = bestDiscount.getBenefit().getDiscountPercentage();
            BigDecimal discount = originalPrice.multiply(BigDecimal.valueOf(discountPercent))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

            BigDecimal finalPrice = originalPrice.subtract(discount);

            // Marcar beneficio como usado
            shopService.markBenefitAsUsed(bestDiscount.getId(), traveler.getEmail());

            System.out.println("✅ Descuento aplicado: " + discountPercent + "% = $" + discount);
            System.out.println("   Precio original: $" + originalPrice + " → Precio final: $" + finalPrice);

            return finalPrice;
        }

        return originalPrice;
    }

    /**
     * Calcula y otorga XP al usuario por crear una reserva.
     * ✅ MODIFICADO: Incluye bonus de beneficios XP_BONUS
     */
    private void awardXpForReservation(Traveler traveler, BigDecimal totalPrice) {
        int totalXp = BASE_XP_PER_RESERVATION;

        // Bonus por monto de la reserva
        if (totalPrice != null && totalPrice.compareTo(BigDecimal.ZERO) > 0) {
            int priceXp = totalPrice.divide(BigDecimal.TEN, 0, java.math.RoundingMode.DOWN).intValue();
            totalXp += priceXp;
        }

        // ✅ NUEVO: Bonus de beneficios XP_BONUS
        List<UserBenefit> xpBonusBenefits = shopService.getActiveBenefitsByType(
                traveler.getId(),
                Benefit.BenefitType.XP_BONUS);

        for (UserBenefit xpBenefit : xpBonusBenefits) {
            if (xpBenefit.getBenefit().getXpBonus() != null) {
                totalXp += xpBenefit.getBenefit().getXpBonus();
                shopService.markBenefitAsUsed(xpBenefit.getId(), traveler.getEmail());
                System.out.println("✅ Bonus XP aplicado: +" + xpBenefit.getBenefit().getXpBonus());
            }
        }

        // Guardar nivel anterior para detectar subida
        int oldLevel = traveler.getLevel();

        // Añadir XP
        traveler.addXp(totalXp);
        traveler.addTrippyCoins(totalXp);
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
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reserva no encontrada: " + reservationId));

        if (!reservation.getTraveler().getEmail().equals(userEmail) &&
                !reservation.getPublication().getHost().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("No tienes permiso para ver esta reserva.");
        }

        return ReservationResponseDTO.from(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getMyReservations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + userEmail));

        List<Reservation> reservations = reservationRepository.findByTravelerId(user.getId());

        return reservations.stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsForPublication(Long publicationId, String requestingUserEmail) {
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publicación no encontrada: " + publicationId));

        if (pub.getHost() == null || !pub.getHost().getEmail().equals(requestingUserEmail)) {
            throw new SecurityException("No tenés permiso para ver las reservas de esta publicación.");
        }

        return reservationRepository.findByPublicationIdWithAssociations(publicationId);
    }
}