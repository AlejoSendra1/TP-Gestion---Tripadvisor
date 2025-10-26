package ar.uba.fi.gestion.trippy.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
        UserDTO userDTO = userService.createUser(data).orElseThrow(); // 2- hacer q devuelva un userDTO y userDTO interface
        return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
    }

}