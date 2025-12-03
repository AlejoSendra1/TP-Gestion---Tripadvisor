package ar.uba.fi.gestion.trippy.reservation.dto;

import ar.uba.fi.gestion.trippy.reservation.*;
import ar.uba.fi.gestion.trippy.user.Traveler;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationResponseDTO(
        Long id,
        Long publicationId,
        String pubName,
        Long travelerId,
        String travelerName,
        LocalDateTime reservationDate,
        BigDecimal totalPrice,
        String status,
        String notes,
        String reservationType,

        String publicationTitle,
        String publicationMainImageUrl,
        String travelerEmail,

        // Hotel
        LocalDate checkIn,
        LocalDate checkOut,
        Integer roomCount,

        // Restaurant / Activity (date/time based)
        LocalDateTime dateTime,
        Integer guestCount,

        // Activity
        Integer participantCount,

        // Coworking (date range)
        LocalDate startDate,
        LocalDate endDate
) {
    public static ReservationResponseDTO from(Reservation r) {
        Long id = r.getId();
        Long pubId = r.getPublication() != null ? r.getPublication().getId() : null;
        String pubName = r.getPublication() != null ? r.getPublication().getTitle() : null;
        Long travelerId = r.getTraveler() != null ? r.getTraveler().getId() : null;
        String travelerName = null;
        if (r.getTraveler() != null && r.getTraveler() instanceof Traveler traveler) {
            travelerName = traveler.getFirstName() + " " + traveler.getLastName();
        }
        LocalDateTime reservationDate = r.getReservationDate();
        BigDecimal totalPrice = r.getTotalPrice();
        String status = r.getStatus() != null ? r.getStatus().name() : null;
        String notes = r.getNotes();

        String type = r.getClass().getSimpleName().toUpperCase();

        String pubTitle = r.getPublication() != null ? r.getPublication().getTitle() : null;
        String pubImg = r.getPublication() != null ? r.getPublication().getMainImageUrl() : null;
        String travEmail = r.getTraveler() != null ? r.getTraveler().getEmail() : null;

        // defaults
        LocalDate checkIn = null;
        LocalDate checkOut = null;
        Integer roomCount = null;

        LocalDateTime dateTime = null;
        Integer guestCount = null;
        Integer participantCount = null;

        LocalDate startDate = null;
        LocalDate endDate = null;

        if (r instanceof ReservationHotel hotel) {
            checkIn = hotel.getCheckIn();
            checkOut = hotel.getCheckOut();
            roomCount = hotel.getRoomCount();
        } else if (r instanceof ReservationRestaurant restaurant) {
            dateTime = restaurant.getDateTime();
            guestCount = restaurant.getGuestCount();
        } else if (r instanceof ReservationActivity activity) {
            dateTime = activity.getStartDateTime();
            participantCount = activity.getParticipantCount();
        } else if (r instanceof ReservationCoworking cw) {
            // getters in class use 'getstarDate' / 'getendDate'
            startDate = cw.getstarDate();
            endDate = cw.getendDate();
            guestCount = cw.getGuestCount();
        }

        return new ReservationResponseDTO(
                id,
                pubId,
                pubName,
                travelerId,
                travelerName, 
                reservationDate,
                totalPrice,
                status,
                notes,
                type,
                pubTitle,
                pubImg,
                travEmail,
                checkIn,
                checkOut,
                roomCount,
                dateTime,
                guestCount,
                participantCount,
                startDate,
                endDate
        );
    }
}
