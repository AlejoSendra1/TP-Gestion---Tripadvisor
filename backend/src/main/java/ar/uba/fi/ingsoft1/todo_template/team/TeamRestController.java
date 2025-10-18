package ar.uba.fi.ingsoft1.todo_template.team;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import ar.uba.fi.ingsoft1.todo_template.common.exception.DuplicateEntityException;
import ar.uba.fi.ingsoft1.todo_template.common.exception.GlobalExceptionHandler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/teams")
@Tag(name = "Teams")
public class TeamRestController {
    private final TeamService teamService;

    private final GlobalExceptionHandler globalExceptionHandler;
    public TeamRestController(TeamService teamService) {
        this.teamService = teamService;
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    @PostMapping(consumes = "application/json",
                produces = "application/json")
    @Operation(summary = "Create a new team")
    @ApiResponse(responseCode = "201",
                description = "Team created successfully",
                content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "409",
                description = "Team with that name already exists",
                content = @Content)
    public ResponseEntity<?> createTeam(
        @Valid
        @RequestBody
        TeamCreateDTO teamCreateDTO
    ) {
        try {
            TeamDTO teamDTO = teamService.createTeam(teamCreateDTO);
            return new ResponseEntity<>(teamDTO, HttpStatus.CREATED);
        }
        catch (DuplicateEntityException exception) {
            return globalExceptionHandler.handleDuplicateEntityException(exception);
        }
    }

    @GetMapping(value = "/{id}",
                produces = "application/json")
    @Operation(summary = "Search for a team by name")
    @ApiResponse(responseCode = "200",
                description = "Team obtained successfully")
    @ApiResponse(responseCode = "404",
                description = "Team not found")
    public ResponseEntity<?> getTeam(
        @PathVariable
        String id
    ) {
        try {
            TeamDTO teamDTO = teamService.getTeam(id);
            return new ResponseEntity<>(teamDTO, HttpStatus.OK);
        }
        catch (EntityNotFoundException exception) {
            return globalExceptionHandler.handleEntityNotFoundException(exception);
        }
    }

    @GetMapping(produces = "application/json")
    @Operation(summary = "Search for teams")
    @ApiResponse(responseCode = "200",
                description = "Teams obtained successfully")
    @ApiResponse(responseCode = "404",
                description = "Teams not found")
    public ResponseEntity<?> getTeams() {
        try {
            List<TeamDTO> teams = teamService.getTeams();
            return new ResponseEntity<>(teams, HttpStatus.OK);
        }
        catch (EntityNotFoundException exception) {
            return globalExceptionHandler.handleEntityNotFoundException(exception);
        }
    }

    @PatchMapping(value = "/{id}",
                consumes = "application/json",
                produces = "application/json")
    @Operation(summary = "Update a team")
    @ApiResponse(responseCode = "200",
                description = "Team updated successfully")
    @ApiResponse(responseCode = "409",
                description = "Team with that name already exists")
    @ApiResponse(responseCode = "404",
                description = "Team not found")
    public ResponseEntity<?> updateTeam(
        @PathVariable
        String id,
        @Valid
        @RequestBody
        TeamCreateDTO teamCreateDTO
    ) {
        try {
            TeamDTO teamDTO = teamService.updateTeams(id, teamCreateDTO);
            return new ResponseEntity<>(teamDTO, HttpStatus.OK);
        }
        catch (EntityNotFoundException exception) {
            return globalExceptionHandler.handleEntityNotFoundException(exception);
        }
        catch (DuplicateEntityException exception) {
            return globalExceptionHandler.handleDuplicateEntityException(exception);
        }
    }

    @PatchMapping(value = "/{id}/player")
    @Operation(summary = "Add player to a team")
    @ApiResponse(responseCode = "200",
                description = "Added player to team successfully")
    @ApiResponse(responseCode = "409",
                description = "Player already exists in the team")
    @ApiResponse(responseCode = "400",
                description = "Team is full or player name is empty")
    @ApiResponse(responseCode = "404",
                description = "Team not found")
    public ResponseEntity<?> addPlayer(
        @PathVariable
        String id,
        @RequestParam
        String playerName
    ) {
        try {
            String newPlayer = teamService.addPlayer(id, playerName);
            return new ResponseEntity<>(newPlayer, HttpStatus.OK);
        }
        catch (EntityNotFoundException exception) {
            return globalExceptionHandler.handleEntityNotFoundException(exception);
        }
        catch (DuplicateEntityException exception) {
            return globalExceptionHandler.handleDuplicateEntityException(exception);
        }
        catch (IllegalArgumentException exception) {
            return globalExceptionHandler.handleIllegalArgumentException(exception);
        }
    }

    @DeleteMapping(value = "/{id}/player")
    @Operation(summary = "Remove a player")
    @ApiResponse(responseCode = "204",
                description = "Player removed successfully")
    @ApiResponse(responseCode = "404",
                description = "Team or player not found")
    @ApiResponse(responseCode = "400",
                description = "Captain can not be removed")
    public ResponseEntity<?> removePlayer(
        @PathVariable
        String id,
        @RequestParam
        String playerName
    ) {
        try {
            teamService.removePlayer(id, playerName);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch (EntityNotFoundException exception) {
            return globalExceptionHandler.handleEntityNotFoundException(exception);
        }
        catch (IllegalArgumentException exception) {
            return globalExceptionHandler.handleIllegalArgumentException(exception);
        }
    }

    @DeleteMapping(value = "/{id}")
    @Operation(summary = "Delete a team")
    @ApiResponse(responseCode = "204",
                description = "Team deleted successfully")
    @ApiResponse(responseCode = "404",
                description = "Team not found")
    public ResponseEntity<?> deleteTeam(
        @PathVariable
        String id
    ) {
        try {
            teamService.deleteTeam(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (EntityNotFoundException excpetion) {
            return globalExceptionHandler.handleEntityNotFoundException(excpetion);
        }
    }
}