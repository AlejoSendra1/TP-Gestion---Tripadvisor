package ar.uba.fi.ingsoft1.todo_template.team;

import java.util.Arrays;

import jakarta.validation.constraints.*;
import org.springframework.format.annotation.NumberFormat;

import io.swagger.v3.oas.annotations.media.Schema;

public record TeamCreateDTO(
    @NotBlank(message = "Team name is required")
    @Schema(description = "Team name is required",
            minLength = 1,
            maxLength = 100,
            example = "All Stars",
            required = true)
    String name,

    @Schema(description = "Team logo is optional",
            minLength = 1,
            maxLength = 100,
            example = "logo.png",
            required = false)
    String logo,

    @Schema(description = "Team colors are optional",
            example = "red, blue, green",
            required = false)
    String colors,

    @NumberFormat(style = NumberFormat.Style.NUMBER)
    @Min(value = 1, message = "Team level must be at least 1")
    @Max(value = 10, message = "Team level must be at most 10")
    @Positive
    @Schema(description = "Team skill level is optional, must be between 1 and 10",
            minLength = 1,
            maxLength = 10,
            example = "10",
            required = false)
    Integer skill,

    @Size(min = 0, max = 4, message = "Team must have between 0 and 4 players")
    @Schema(description = "List of players in the team",
            minLength = 0,
            maxLength = 4,
            example = "[\"Di Maria\", \"De Paul\", \"Otamendi\", \"Dibu\"]",
            required = false)
    String[] players
) {
    public Team asTeam() {
        Team team = new Team(name);
        
        if (logo != null && !logo.isEmpty()) {
            team.setLogo(logo);
        }

        if (colors != null && !colors.isEmpty()) {            
            team.setColors(colors);
        }

        if (skill != null && skill >= 1 && skill <= 10) {
            team.setSkill(skill);
        }

        if (players != null && players.length > 0) {
            team.setPlayers(Arrays.asList(players));
        }
        
        return team;
    }
}