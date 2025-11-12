package ar.uba.fi.gestion.trippy.user;

import ar.uba.fi.gestion.trippy.user.dto.RegistrationRequestDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserDTO;
import ar.uba.fi.gestion.trippy.user.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/users")
@Tag(name = "1 - Users")
class UserRestController {
    private final UserService userService;

    @Autowired
    UserRestController(UserService userService) {
        this.userService = userService;
    }

    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "409", description = "Email already in use")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody RegistrationRequestDTO data) {
        UserDTO userDTO = userService.createUser(data).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile with level and XP information")
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @ApiResponse(responseCode = "401", description = "User not authenticated")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
        UserProfileDTO profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{email}/xp")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add XP to a user (Admin only)")
    @ApiResponse(responseCode = "200", description = "XP added successfully")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    @ApiResponse(responseCode = "403", description = "Not authorized (Admin only)")
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<String> addXpToUser(
            @PathVariable String email,
            @RequestParam Integer xp) {
        userService.addXpToUser(email, xp);
        return ResponseEntity.ok("XP añadido exitosamente al usuario " + email);
    }

}