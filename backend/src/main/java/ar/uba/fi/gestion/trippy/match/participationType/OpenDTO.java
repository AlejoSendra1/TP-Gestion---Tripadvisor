package ar.uba.fi.gestion.trippy.match.participationType;

import ar.uba.fi.gestion.trippy.user.User;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.DiscriminatorValue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.Set;
import java.util.stream.Collectors;

@Schema(description = "Participación abierta")
@DiscriminatorValue("Open")
public class OpenDTO extends ParticipationTypeDTO {
        @Schema(description = "Cantidad mínima de jugadores requeridos", example = "5")
        @Positive @NotNull private Integer minPlayersCount;
        @Schema(description = "Cantidad máxima de jugadores permitidos", example = "10")
        @Positive @NotNull private Integer maxPlayersCount;
        @Schema(description = "Lista de usuarios que se inscribieron al partido", example = "[\"user1@example.com\", \"user2@example.com\"]")
        private Set<String> players;

    public Integer getMaxPlayersCount() {
        return maxPlayersCount;
    }

    public Integer getMinPlayersCount() {
        return minPlayersCount;
    }

    public Set<String> getPlayers() {
        return players;
    }

    @JsonCreator
    public OpenDTO(
            @JsonProperty("minPlayersCount") Integer minPlayersCount,
            @JsonProperty("maxPlayersCount") Integer maxPlayersCount,
            @JsonProperty("players") Set<String> players
    ) {
        this.minPlayersCount = minPlayersCount;
        this.maxPlayersCount = maxPlayersCount;
        this.players = players;
    }

    public OpenDTO(Open open) {
        this.minPlayersCount = open.getMinPlayersCount();
        this.maxPlayersCount = open.getMaxPlayersCount();
        this.players = open.getPlayers().stream().map(User::getEmail).collect(Collectors.toSet());;
    }
}

