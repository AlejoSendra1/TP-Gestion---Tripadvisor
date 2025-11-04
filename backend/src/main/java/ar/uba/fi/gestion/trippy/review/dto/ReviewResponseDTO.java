package ar.uba.fi.gestion.trippy.review.dto;

import java.time.LocalDateTime;

public record ReviewResponseDTO(
        String username,
        String userLastname,
        Short rating,
        String reviewContent,
        LocalDateTime createdAt
) {}