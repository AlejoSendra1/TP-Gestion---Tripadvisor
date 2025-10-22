package ar.uba.fi.gestion.trippy.match.participationType;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.DiscriminatorValue;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Participación cerrada")
@DiscriminatorValue("Close")
public class CloseDTO extends ParticipationTypeDTO {
    @Schema(description = "Nombre del equipo 1", example = "Los Halcones")
    @NotBlank String teama;

    @Schema(description = "Nombre del equipo 2", example = "Las Panteras")
    @NotBlank String teamb;

    public String getTeama() {
        return teama;
    }

    public String getTeamb() {
        return teamb;
    }


    public CloseDTO(Close close) {
        this.teama = close.getTeama().getName();
        this.teamb = close.getTeamb().getName();
    }

    @JsonCreator
    public CloseDTO(
            @JsonProperty("teama") String teama,
            @JsonProperty("teamb") String teamb
    ) {
        this.teama = teama;
        this.teamb = teamb;
    }
}