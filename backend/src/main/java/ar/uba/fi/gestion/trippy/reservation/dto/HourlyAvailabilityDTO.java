package ar.uba.fi.gestion.trippy.reservation.dto;

import java.time.LocalDateTime;
public record HourlyAvailabilityDTO( LocalDateTime start, LocalDateTime end, boolean available, Integer availableSeats ) {}