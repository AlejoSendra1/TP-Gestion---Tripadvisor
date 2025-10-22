package ar.uba.fi.gestion.trippy.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sessions")
@Tag(name = "2 - Sessions")
class SessionRestController {

    private final UserService userService;

    @Autowired
    SessionRestController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(produces = "application/json")
    @Operation(summary = "Log in, creating a new session")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "401", description = "Invalid username or password supplied", content = @Content)
    public TokenDTO login(
            @Valid @NonNull @RequestBody UserLoginDTO data
    ) {
        return userService
                .loginUser(data)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @PutMapping(produces = "application/json")
    @Operation(summary = "Refresh a session")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "401", description = "Invalid refresh token supplied", content = @Content)
    public TokenDTO refresh(
            @Valid @NonNull @RequestBody RefreshDTO data
    ) {
        return userService
                .refresh(data)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping(value = "/me", produces = "application/json")
    @Operation(summary = "Get current user's name")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Current user name")
    public Map<String, String> getCurrentUserName() {
        String name = userService.getCurrentUserName();
        return Map.of("name", name);
    }

    @GetMapping(value = "/profile", produces = "application/json")
    @Operation(summary = "Get current user's profile")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Current user profile")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
        UserProfileDTO userProfile  = userService.getCurrentUserProfile();
        return ResponseEntity.ok(userProfile);
    }


    @GetMapping(value = "/user-zones", produces = "application/json")
    @Operation(summary =  "Get zones")
        public List<String> getAllUserZones() {
            return Arrays.stream(UserZones.values())
                    .map(Enum::name) // Gets the enum name (e.g., "VICENTE_LOPEZ")
                    .collect(Collectors.toList());
        }

}
