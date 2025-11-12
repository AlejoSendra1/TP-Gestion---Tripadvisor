package ar.uba.fi.gestion.trippy.reservation;

import ar.uba.fi.gestion.trippy.publication.Publication;
import ar.uba.fi.gestion.trippy.reservation.dto.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.user.User;
import org.springframework.stereotype.Component;

@Component
public class ReservationFactory {

    /**
     * Decide la subclase de Reservation según la clase de la publicación.
     * Usa el nombre de la clase de la publicación para evitar depender de getters no existentes.
     */
    public Reservation createForPublication(Publication pub, User traveler, ReservationCreateDTO dto) {
        String cls = pub.getClass().getSimpleName().toUpperCase();
        return switch (cls) {
            case "HOTEL" -> new ReservationHotel(pub, traveler, dto);
            case "RESTAURANT" -> new ReservationRestaurant(pub, traveler, dto);
            case "COWORKING" -> new ReservationCoworking(pub, traveler, dto);
            case "ACTIVITY" -> new ReservationActivity(pub, traveler, dto);
            default -> throw new IllegalStateException("Tipo de publicación no soportado: " + cls);
        };
    }
}
