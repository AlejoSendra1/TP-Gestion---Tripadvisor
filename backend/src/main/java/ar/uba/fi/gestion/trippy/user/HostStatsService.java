// java
package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.publication.PublicationRepository;
import ar.uba.fi.gestion.trippy.publication.dto.PublicationIncomeDTO;
import ar.uba.fi.gestion.trippy.user.dto.HostStatsDTO;
import ar.uba.fi.gestion.trippy.review.ReviewRepository;
import ar.uba.fi.gestion.trippy.reservation.ReservationRepository;
import ar.uba.fi.gestion.trippy.reservation.ReservationStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HostStatsService {
    private static final Logger logger = LoggerFactory.getLogger(HostStatsService.class);

    private final PublicationRepository publicationRepository;
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;

    public HostStatsService(PublicationRepository publicationRepository,
                            ReviewRepository reviewRepository,
                            ReservationRepository reservationRepository) {
        this.publicationRepository = publicationRepository;
        this.reviewRepository = reviewRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public HostStatsDTO getStatsForOwner(String ownerEmail) {

        logger.info("getStatsForOwner - inicio para ownerEmail={}", ownerEmail);

        var publications = publicationRepository.findByHostEmail(ownerEmail);
        if (publications == null || publications.isEmpty()) {
            System.out.println("getStatsForOwner - no se encontraron publicaciones para " + ownerEmail);
            return new HostStatsDTO(0.0, BigDecimal.ZERO, null);
        }

        logger.debug("getStatsForOwner - publicaciones encontradas: {}", publications.size());

        var pubIds = publications.stream()
                .map(p -> p.getId())
                .collect(Collectors.toList());

        logger.debug("getStatsForOwner - pubIds={}", pubIds);

        // -----------------------
        // 1) Promedio de rating
        // -----------------------
        Double avgRating = reviewRepository.findAverageRatingByPublicationIds(pubIds);
        if (avgRating == null) avgRating = 0.0;

        System.out.println("getStatsForOwner - promedio de reseñas calculado: " + avgRating);

        // -----------------------
        // 2) Ingresos totales
        // -----------------------
        BigDecimal totalIncome = BigDecimal.ZERO;
        Map<Long, BigDecimal> incomeByPub = new HashMap<>();

        for (Long pid : pubIds) {
            BigDecimal incConfirmed =
                    reservationRepository.sumIncomeByPublicationIdAndStatus(pid, ReservationStatus.CONFIRMED);
            BigDecimal incCompleted =
                    reservationRepository.sumIncomeByPublicationIdAndStatus(pid, ReservationStatus.COMPLETED);

            if (incConfirmed == null) incConfirmed = BigDecimal.ZERO;
            if (incCompleted == null) incCompleted = BigDecimal.ZERO;

            BigDecimal income = incConfirmed.add(incCompleted);

            incomeByPub.put(pid, income);           // para buscar la top publicación
            totalIncome = totalIncome.add(income);  // suma al total del host

            logger.debug("getStatsForOwner - ingreso pubId={} -> {}", pid, income);
        }

        System.out.println("getStatsForOwner - ingreso total (confirmadas + completed): " + totalIncome);

        // -----------------------
        // 3) Publicación con más ingresos
        // -----------------------
        PublicationIncomeDTO topPublicationDTO = null;

        Optional<Map.Entry<Long, BigDecimal>> maxEntry =
                incomeByPub.entrySet().stream().max(Map.Entry.comparingByValue());

        if (maxEntry.isPresent() && maxEntry.get().getValue().compareTo(BigDecimal.ZERO) > 0) {

            Long topId = maxEntry.get().getKey();
            var pub = publications.stream()
                    .filter(p -> p.getId().equals(topId))
                    .findFirst()
                    .orElse(null);

            if (pub != null) {
                topPublicationDTO = new PublicationIncomeDTO(
                        pub.getId(), pub.getTitle(), maxEntry.get().getValue()
                );

                System.out.println("getStatsForOwner - top publication: id="
                        + pub.getId() + ", title=" + pub.getTitle()
                        + ", income=" + maxEntry.get().getValue());
            } else {
                logger.warn("getStatsForOwner - top publication id={} no encontrada en lista", topId);
            }

        } else {
            System.out.println("getStatsForOwner - no hay ingresos positivos por publicación");
        }

        System.out.println("getStatsForOwner - fin para " + ownerEmail);

        return new HostStatsDTO(avgRating, totalIncome, topPublicationDTO);
    }
}
