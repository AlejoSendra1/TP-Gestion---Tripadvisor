package ar.uba.fi.ingsoft1.todo_template.match.matchOrganizer;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Set;

public class MatchOrganizerDTO {
    @Schema(description = "Cantidad de jugadores", example = "16")
    Set<Long> availablePlayers;
    @Schema(description = "Cantidad jugadores equipo A", example = "8")
    Set<Long> teamAPlayers;
    @Schema(description = "Cantidad jugadores equipo B", example = "8")
    Set<Long> teamBPlayers;

    public MatchOrganizerDTO(MatchOrganizer matchOrganizer) {
        this.availablePlayers = matchOrganizer.getAvailablePlayers();
        this.teamAPlayers = matchOrganizer.getTeamAPlayers();
        this.teamBPlayers = matchOrganizer.getTeamBPlayers();
    }

    public Set<Long> getAvailablePlayers(){
        return availablePlayers;
    }

    public Set<Long> getTeamAPlayers(){
        return teamAPlayers;
    }

    public Set<Long> getTeamBPlayers(){
        return teamBPlayers;
    }
}
