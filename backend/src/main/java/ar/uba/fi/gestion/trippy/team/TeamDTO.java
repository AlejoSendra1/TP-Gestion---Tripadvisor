package ar.uba.fi.gestion.trippy.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;

import java.util.Arrays;

public record TeamDTO(

    @Schema(description = "Nombre del equipo", example = "Lobos")
    String name,
    @Schema(description = "Capitan del equipo", example = "Juan Lopez")
    String captain,

    @Schema(description = "Escudo del equipo")
    String logo,
    @Schema(description = "Color del equipo", example = "Verde")
    String colors,

    @Schema(description = "Habilidad/Destreza del equipo", example = "9")
    @Positive
    Integer skill,
    @Schema(description = "Jugadores del equipo")
    String[] players
) {
    public TeamDTO(Team team) {
        this(team.getName(),
            team.getCaptain(),
            team.getLogo(),
            team.getColors(),
            team.getSkill(),
            team.getPlayers().toArray(new String[0]));
    }

    public Team asTeam() {
        Team team = new Team(name, captain);
        team.setLogo(logo);
        team.setColors(colors);
        team.setSkill(skill);
        team.setPlayers(Arrays.asList(players));
        return team;
    }
}
