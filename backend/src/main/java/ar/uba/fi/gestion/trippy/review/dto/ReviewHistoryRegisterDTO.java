package ar.uba.fi.gestion.trippy.review.dto;

import java.time.LocalDateTime;

public record ReviewHistoryRegisterDTO(
        String placeName,
        Long publicationId,
        Short rating,
        String reviewContent,
        LocalDateTime createdAt,
        Long qualification
) {}