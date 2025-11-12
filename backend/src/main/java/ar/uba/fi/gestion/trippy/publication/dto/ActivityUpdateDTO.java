package ar.uba.fi.gestion.trippy.publication.dto;

public record ActivityUpdateDTO(
    Integer durationInHours,
    String meetingPoint,
    String whatIsIncluded,
    String activityLevel,
    String language,
    Integer maxGroupSize // Nuevo campo opcional para patch
) {}
