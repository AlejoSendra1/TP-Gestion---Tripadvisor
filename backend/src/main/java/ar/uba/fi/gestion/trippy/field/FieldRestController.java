package ar.uba.fi.gestion.trippy.field;

import java.time.LocalDate;
import java.util.List;

import ar.uba.fi.gestion.trippy.user.UserZones;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ar.uba.fi.gestion.trippy.FieldSchedule.TimeSlotDTO;
import ar.uba.fi.gestion.trippy.reservation.ReservationCreateDTO;
import ar.uba.fi.gestion.trippy.reservation.ReservationDTO;
import ar.uba.fi.gestion.trippy.reviews.ReviewCreateDTO;
import ar.uba.fi.gestion.trippy.reviews.ReviewDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/fields")
@Tag(name = "Fields")
public class FieldRestController {

    private final FieldService fieldService;

    public FieldRestController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    @GetMapping(produces = "application/json")
    @Operation(summary = "Get all fields")
    @ApiResponse(responseCode = "200", description = "Fields found")
    @ApiResponse(responseCode = "404", description = "Fields not found", content = @Content)
    public List<FieldDTO> getFields() {
        return fieldService.getAllFields();
    }

    @GetMapping(value = "/{id}", produces = "application/json")
    @Operation(summary = "Get a football field given the specified id")
    @ApiResponse(responseCode = "200", description = "Field found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> getFieldById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(fieldService.getFieldById(id));
    }

    @GetMapping(value = "/owner/{ownerEmail}", produces = "application/json")
    @Operation(summary = "Get all fields by owner email")
    @ApiResponse(responseCode = "200", description = "Fields found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Owner not found", content = @Content)
    public ResponseEntity<?> getFieldsByOwnerId(@PathVariable String ownerEmail) {
        return ResponseEntity.ok(fieldService.getFieldsByOwner(ownerEmail).stream().toList());
    }

    @GetMapping(value = "/owner/me", produces = "application/json")
    @Operation(summary = "Get all fields owned by the current user")
    @ApiResponse(responseCode = "200", description = "Fields found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Owner not found", content = @Content)
    public ResponseEntity<?> getFieldsOwns() {
        String ownerEmail = fieldService.getCurrentUser().getEmail();
        return ResponseEntity.ok(fieldService.getFieldsByOwner(ownerEmail).stream().toList());
    }

    @GetMapping(value = "/zone/{zone}", produces = "application/json")
    @Operation(summary = "Get all fields by zone")
    @ApiResponse(responseCode = "200", description = "Fields found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Fields not found", content = @Content)
    public ResponseEntity<?> getFieldsByZone(@PathVariable UserZones zone) {
        return ResponseEntity.ok(fieldService.getFieldsByZone(zone).stream().toList());
    }

    @GetMapping(value = "/name/{name}", produces = "application/json")
    @Operation(summary = "Get all fields by name. This is a case-sensitive search and match the full name.")
    @ApiResponse(responseCode = "200", description = "Fields found", content = @Content(mediaType = "application/json"))
    public List<FieldDTO> getFieldByName(@PathVariable String name) {
        return fieldService.getFieldByName(name).stream().toList();
    }

    @GetMapping(value = "/feature/{feature}", produces = "application/json")
    @Operation(summary = "Get all fields by feature")
    @ApiResponse(responseCode = "200", description = "Fields found", content = @Content(mediaType = "application/json"))
    public List<FieldDTO> getFieldsByFeature(@PathVariable FieldFeatures feature) {
        return fieldService.getFieldsByFeature(feature).stream().toList();
    }

    @GetMapping(value = "{id}/reviews/", produces = "application/json")
    @Operation(summary = "Get all reviews for a field by its id")
    @ApiResponse(responseCode = "200", description = "Reviews found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    public ResponseEntity<?> getReviewsByFieldId(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(fieldService.getReviewsByFieldId(id).stream().toList());
    }

    @GetMapping(value = "{id}/reservations/", produces = "application/json")
    @Operation(summary = "Get all reservations for a field by its id")
    @ApiResponse(responseCode = "200", description = "Reservations found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    public ResponseEntity<?> getReservationsByFieldId(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(fieldService.getReservationsByFieldId(id).stream().toList());
    }

    @GetMapping(value = "{id}/reservations/availableSlots", produces = "application/json")
    @Operation(summary = "Get all available time slots for a field by its id")
    @ApiResponse(responseCode = "200", description = "Available time slots found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    public ResponseEntity<?> getAvailableTimeSlotsByFieldId(@PathVariable @Positive Long id,
            @RequestParam(required = true) LocalDate date) {
        return ResponseEntity.ok(
            fieldService.getAvailableSlotsForReservations(date, id));
    }

    @GetMapping(value = "/reservations/organizer/{organizerEmail}", produces = "application/json")
    @Operation(summary = "Get all reservations for a field by its id")
    @ApiResponse(responseCode = "200", description = "Reservations found", content = @Content(mediaType = "application/json"))
    public List<ReservationDTO> getReservationsByOrganizer(@PathVariable @Positive String organizerEmail) {
        return fieldService.getReservationByOrganizerEmail(organizerEmail).stream().toList();
    }

    @GetMapping(value = "/reservations/organizer/me", produces = "application/json")
    @Operation(summary = "Get all reservations for a field by its id")
    @ApiResponse(responseCode = "200", description = "Reservations found", content = @Content(mediaType = "application/json"))
    public List<ReservationDTO> getMyReservations() {
        String organizerEmail = fieldService.getCurrentUser().getEmail();
        return fieldService.getReservationByOrganizerEmail(organizerEmail).stream().toList();
    }

    @GetMapping(value = "/{id}/reservations/statistics", produces = "application/json")
    @Operation(summary = "Get reservation statistics for a field by its id")
    @ApiResponse(responseCode = "200", description = "Reservation statistics found", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    public ResponseEntity<?> getReservationStatistics(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(fieldService.getStaticticsByFieldId(id));
    }

    @PostMapping(value = "/{id}/reservations/unavailableSlots", produces = "application/json")
    @Operation(summary = "Block time slots for a field by its id")
    @ApiResponse(responseCode = "200", description = "Unavailable time slots blocked", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "400", description = "Invalid data", content = @Content)
    @ApiResponse(responseCode = "403", description = "User is not authorized to block time slots for this field", content = @Content)
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    @ApiResponse(responseCode = "409", description = "Time slot is unavailable", content = @Content)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> blockTimeSlots(
            @PathVariable @Positive Long id,
            @Valid @RequestBody TimeSlotDTO unavailableTimeSlots) {
        fieldService.addUnavailbleTimeSlotToField(id, unavailableTimeSlots);
        return ResponseEntity.ok().build();
    }

    @PostMapping(consumes = "application/json", produces = "application/json")
    @Operation(summary = "Create a new Field")
    @ApiResponse(responseCode = "201", description = "Field created", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "400", description = "Invalid data", content = @Content)
    @ApiResponse(responseCode = "404", description = "User is not logged in to create this field", content = @Content)
    @ApiResponse(responseCode = "409", description = "Field with the same name already exists", content = @Content)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createField(
            @Valid @RequestBody FieldCreateDTO fieldCreateDTO) {
        FieldDTO createdField = this.fieldService.createField(fieldCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdField);
    }

    @PostMapping(consumes = "application/json", produces = "application/json", value = "/{id}/reviews")
    @Operation(summary = "Create a new review for a field")
    @ApiResponse(responseCode = "201", description = "Review created", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createReview(
            @Valid @RequestBody ReviewCreateDTO reviewCreateDTO) {
        ReviewDTO createdReview = fieldService.addReviewToField(reviewCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }

    @PostMapping(consumes = "application/json", produces = "application/json", value = "/{id}/reservations")
    @Operation(summary = "Create a new reservation for a field")
    @ApiResponse(responseCode = "201", description = "Reservation created", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "400", description = "Invalid data", content = @Content)
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    @ApiResponse(responseCode = "409", description = "Unavailable time slot", content = @Content)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createReservation(
            @Valid @RequestBody ReservationCreateDTO reservationCreateDTO) {
        ReservationDTO createdReservation = fieldService.addReservationToField(reservationCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
    }

    @DeleteMapping(value = "/{id}")
    @Operation(summary = "Delete a field by its id")
    @ApiResponse(responseCode = "200", description = "Field deleted successfully")
    @ApiResponse(responseCode = "404", description = "Field not found")
    @ApiResponse(responseCode = "403", description = "User is not authorized to delete this field")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteField(@PathVariable @Positive long id) {
        fieldService.deleteField(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping(value = "/reservations/{reservationId}")
    @Operation(summary = "Delete a reservation by its id")
    @ApiResponse(responseCode = "200", description = "Reservation deleted successfully")
    @ApiResponse(responseCode = "403", description = "User is not authorized to delete this reservation")
    @ApiResponse(responseCode = "404", description = "Reservation not found")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteReservation(
            @PathVariable @Positive Long reservationId) {
        fieldService.deleteReservationByOwner(reservationId);
        return ResponseEntity.ok().build();
    }

    // PATCH

    @PatchMapping(value = "/{id}", consumes = "application/json", produces = "application/json")
    @Operation(summary = "Update a field by its id")
    @ApiResponse(responseCode = "200", description = "Field updated successfully", content = @Content(mediaType = "application/json"))
    @ApiResponse(responseCode = "400", description = "Invalid data", content = @Content)
    @ApiResponse(responseCode = "403", description = "User is not authorized to update this field", content = @Content)
    @ApiResponse(responseCode = "404", description = "Field not found", content = @Content)
    public ResponseEntity<?> updateField(
            @PathVariable @Positive Long id,
            @Valid @RequestBody FieldUpdateDTO fieldUpdateDTO) {
        FieldDTO updatedField = fieldService.updateField(id, fieldUpdateDTO);
        return ResponseEntity.ok(updatedField);
    }

}