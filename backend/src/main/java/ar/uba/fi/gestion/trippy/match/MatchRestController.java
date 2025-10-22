package ar.uba.fi.gestion.trippy.match;

import ar.uba.fi.gestion.trippy.common.exception.DuplicateEntityException;
import ar.uba.fi.gestion.trippy.common.exception.GlobalExceptionHandler;
import ar.uba.fi.gestion.trippy.match.matchOrganizer.MatchOrganizerDTO;
import ar.uba.fi.gestion.trippy.match.matchOrganizer.MatchOrganizerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/matches")
@Tag(name = "Matches")
public class MatchRestController {
    private final MatchService matchService;
    private final MatchOrganizerService matchOrganizerService;
    private final GlobalExceptionHandler globalExceptionHandler;

    public MatchRestController(MatchService matchService, MatchOrganizerService matchOrganizerService) {
        this.matchService = matchService;
        this.matchOrganizerService = matchOrganizerService;
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get a Match given the specified Id")
    @ApiResponse(responseCode = "200", description = "Matchs found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Matchs not found", content = @Content)
    @ResponseStatus(HttpStatus.OK)
    MatchDTO getMatch(
            @Valid @PathVariable @Positive Long id
    ) throws MethodArgumentNotValidException {
        return matchService.getMatch(id);
    }

    @GetMapping(produces = "application/json")
    @Operation(summary = "Get all available Matches")
    @ApiResponse(responseCode = "200", description = "Matches found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Matches not found", content = @Content)
    @ResponseStatus(HttpStatus.OK)
    Page<MatchDTO> getAllAvailableMatches(
            @Valid @ParameterObject Pageable pageable
    ){
        return matchService.getAllAvailableMatches(pageable);
    }

    @GetMapping(value = "/organizedMatches", produces = "application/json")
    @Operation(summary = "Get all Matches manage by actual user")
    @ApiResponse(responseCode = "200", description = "Matches found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Matches not found", content = @Content)
    @ResponseStatus(HttpStatus.OK)
    Page<MatchDTO> getAllManageMatches(
            @Valid @ParameterObject Pageable pageable
    ){
        return matchService.getSelfOrganizedMatches(pageable);
    }

    @GetMapping(value = "/selfRegisteredMatches", produces = "application/json")
    @Operation(summary = "Get all Matches the actual user is going to play")
    @ApiResponse(responseCode = "200", description = "Matches found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Matches not found", content = @Content)
    @ResponseStatus(HttpStatus.OK)
    Page<MatchDTO> getSelfRegisteredMatches(
            @Valid @ParameterObject Pageable pageable
    ) {
        return matchService.getMatchesActualPlayerParticipatesIn(pageable);
    }

    @PostMapping(consumes = "application/json", produces = "application/json")
    @Operation(summary = "Create a new Match")
    @ApiResponse(responseCode = "201", description = "Match created", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "400", description = "Invalid data", content = @Content)
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    @ApiResponse(responseCode = "409", description = "Unavailable time slot", content = @Content)
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<?> createMatch(
            @Valid @RequestBody MatchCreateDTO matchCreateDTO
    ) {
        try {
            MatchDTO createdMatch = matchService.createMatch(matchCreateDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMatch);
        } catch (EntityNotFoundException e) {
            return (ResponseEntity<?>) globalExceptionHandler.handleEntityNotFoundException(e).getBody();
        } catch (DuplicateEntityException e) {
            return (ResponseEntity<?>) globalExceptionHandler.handleDuplicateEntityException(e).getBody();
        } catch (IllegalArgumentException e) {
            return (ResponseEntity<?>) globalExceptionHandler.handleIllegalArgumentException(e).getBody();
        }
    }

    @PatchMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
    @Operation(summary = "Update a Match by its id")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Match updated successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Match not found, Invalid Match ID or you don't have permissions to access the Match")
    ResponseEntity<MatchDTO> updateMatch(
            @Valid @PathVariable @Positive Long id,
            @Valid @RequestBody MatchCreateDTO matchCreateDTO
    ) {
        MatchDTO updatedMatch = matchService.updateMatch(id, matchCreateDTO);
        return ResponseEntity.ok(updatedMatch);
    }

    @DeleteMapping(value = "/{id}")
    @Operation(summary = "Delete a Match by its id")
    @ApiResponse(responseCode = "200", description = "Match deleted successfully")
    @ApiResponse(responseCode = "404", description = "Match not found, Invalid Match ID or you don't have permissions to access the Match")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteMatch(@Valid @PathVariable @Positive Long id){
        matchService.deleteMatch(id);
    }

    @PostMapping(value = "/join/{id}")
    @Operation(summary = "Join a match")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Joined matched successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Could not join match")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<MatchDTO> joinMatch(
            @Valid @PathVariable @Positive Long id
    ) {
        MatchDTO updatedMatch = matchService.joinMatch(id);
        return ResponseEntity.ok(updatedMatch);
    }

    @PostMapping(value = "/leave/{id}")
    @Operation(summary = "Leave a match")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Left match successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Could not leave match")
    @PreAuthorize("hasRole('USER')")
    void leaveMatch(
            @Valid @PathVariable @Positive Long id
    ) {  matchService.leaveMatch(id);
    }

    @PostMapping(value = "/close")
    @Operation(summary = "Close a match")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Closed match successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Could not close match")
    @ApiResponse(responseCode = "403", description = "You don't have permissions to do that")
    @PreAuthorize("hasRole('USER')")
    void closeMatch(
            @Valid @Positive Long id
    ) {  matchService.closeMatch(id);
    }

    @GetMapping(value = "/teams")
    @Operation(summary = "Get match teams")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Got players in match successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Could not get players in match")
    @ApiResponse(responseCode = "403", description = "You don't have permissions to do that")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<MatchOrganizerDTO> getMatchPlayers(
            @Valid @Positive Long id
    ) {
        MatchOrganizerDTO matchOrganizer = matchOrganizerService.getMatchPlayers(id);
        return ResponseEntity.ok(matchOrganizer);
    }

    @GetMapping(value = "/teams/generate")
    @Operation(summary = "Automatically generate teams")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Generated teams successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Could not generate teams")
    @ApiResponse(responseCode = "403", description = "You don't have permissions to do that")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<MatchOrganizerDTO> generateMatchTeams(
            @Valid @Positive Long id
    ) {
        MatchOrganizerDTO matchOrganizer = matchOrganizerService.generateMatchTeams(id);
        return ResponseEntity.ok(matchOrganizer);
    }

    @PostMapping(value = "/teams/player")
    @Operation(summary = "Move player")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Moved player successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Could not move player")
    @ApiResponse(responseCode = "403", description = "You don't have permissions to do that")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<MatchOrganizerDTO> movePlayer(
            @RequestParam @Valid @Positive Long id,
            @RequestParam @Valid @Positive Long playerId,
            @RequestParam @Valid @PositiveOrZero Short team
    ) {
        MatchOrganizerDTO matchOrganizer = matchOrganizerService.movePlayer(id, playerId, team);
        return ResponseEntity.ok(matchOrganizer);
    }

    @PostMapping(value = "/start")
    @Operation(summary = "Start match")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Started match successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Could not start match")
    @ApiResponse(responseCode = "403", description = "You don't have permissions to do that")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<MatchDTO> startMatch(
            @Valid @Positive Long id
    ) {
        MatchDTO matchDTO = matchService.startMatch(id);
        return ResponseEntity.ok(matchDTO);
    }
}

