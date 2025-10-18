package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.match.participationType.ParticipationTypeDTO;
import ar.uba.fi.ingsoft1.todo_template.match.participationType.ParticipationTypeDTOFactory;
import ar.uba.fi.ingsoft1.todo_template.reservation.ReservationDTO;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = "Datos de un partido",
        example = """
    {
      "participationType": {
        "type": "Open",
        "minPlayers": 4,
        "maxPlayers": 8,
        "players": ["jugador1", "jugador2", "jugador3"]
      },
      "reservation": {
        "fieldId": 3,
        "date": "2025-06-17",
        "start": "18:30",
        "end": "19:30"
      }
      "state":"Active"
    }
    """
)
public record MatchDTO(
    Long id,
    ParticipationTypeDTO participationType,
    ReservationDTO reservation,
    String state
)
{

    public MatchDTO(Match match)  {
        this(match.getId(), ParticipationTypeDTOFactory.createParticipationTypeDTO(match.getParticipationType()), new ReservationDTO(match.getReservation()), match.getState());
    }

    public Long getId() {
        return id;
    }

    public ParticipationTypeDTO getParticipationType() {
        return participationType;
    }

    public ReservationDTO getReservation(){
        return reservation;
    }

    public String getState() { return state; }


}
