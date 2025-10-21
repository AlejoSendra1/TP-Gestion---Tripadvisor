package ar.uba.fi.gestion.trippy.match;

import ar.uba.fi.gestion.trippy.match.participationType.ParticipationType;
import ar.uba.fi.gestion.trippy.match.participationType.ParticipationTypeDTO;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.reservation.ReservationCreateDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(
        description = "Datos necesarios para crear un partido",
        example = """
    {
      "participationType": {
        "type": "Open",
        "minPlayersCount" : 5,
        "maxPlayersCount": 10,
        "players" :["jugador1", "jugador2", "jugador3"]
      },
      "reservation": {
        "fieldId": 3,
        "date": "2025-06-17",
        "start": "18:30",
        "end": "19:30"
      }
    }
    """
)
public record MatchCreateDTO(
        @NotNull ParticipationTypeDTO participationType,
        @NotNull ReservationCreateDTO reservation


){

    public Match asMatch(ParticipationType participationType, Reservation reserv) {
        return new Match(participationType, reserv);
    }

    public ParticipationTypeDTO getParticipationType() {
        return this.participationType;
    }
    public ReservationCreateDTO getReservation() {
        return this.reservation;
    }

}