package ar.uba.fi.gestion.trippy.reservation.dto;

import java.time.LocalDate;

public record DailyAvailabilityDTO(LocalDate date, boolean available) {}
