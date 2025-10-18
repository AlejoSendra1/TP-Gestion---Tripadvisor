package ar.uba.fi.ingsoft1.todo_template.field;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import ar.uba.fi.ingsoft1.todo_template.common.exception.DuplicateEntityException;
import ar.uba.fi.ingsoft1.todo_template.common.exception.InvalidActionException;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import ar.uba.fi.ingsoft1.todo_template.user.UserZones;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import ar.uba.fi.ingsoft1.todo_template.FieldSchedule.FieldSchedule;
import ar.uba.fi.ingsoft1.todo_template.FieldSchedule.FieldScheduleCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.FieldSchedule.TimeSlot;
import ar.uba.fi.ingsoft1.todo_template.FieldSchedule.TimeSlotDTO;
import ar.uba.fi.ingsoft1.todo_template.reservation.Reservation;
import ar.uba.fi.ingsoft1.todo_template.reservation.ReservationCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.reservation.ReservationDTO;
import ar.uba.fi.ingsoft1.todo_template.reservation.ReservationRepository;
import ar.uba.fi.ingsoft1.todo_template.reviews.Review;
import ar.uba.fi.ingsoft1.todo_template.reviews.ReviewCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.reviews.ReviewDTO;
import ar.uba.fi.ingsoft1.todo_template.reviews.ReviewRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class FieldService {
    @Autowired
    private final FieldRepository fieldRepository;
    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final UserService userService;

    public FieldService(FieldRepository fieldRepository,
            ReviewRepository reviewRepository,
            ReservationRepository reservationRepository,
            UserService userService) {
        this.fieldRepository = fieldRepository;
        this.reviewRepository = reviewRepository;
        this.reservationRepository = reservationRepository;
        this.userService = userService;
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof JwtUserDetails)) {
            throw new EntityNotFoundException("No se ha encontrado el usuario actual");
        }
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        User currentUser = userService.getUserByEmail(userDetails.username());
        return currentUser;
    }

    public FieldDTO createField(FieldCreateDTO fieldCreate) {
        Field newField = fieldCreate.asField(getCurrentUser());
        if (!fieldRepository.findByName(newField.getName()).isEmpty()) {
            throw new DuplicateEntityException("Field", "name");
        }

        Field savedField = fieldRepository.save(newField);
        return new FieldDTO(savedField);
    }

    public void deleteField(Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        if (!field.getOwner().getEmail().equals(getCurrentUser().getEmail())) {
            throw new InvalidActionException("Solo el propietario del campo puede eliminarlo");
        }

        if (!field.getReservations().isEmpty()) {
            throw new InvalidActionException("No se puede eliminar un campo con reservas asociadas");
        }

        fieldRepository.delete(field);
    }

    // GET
    public FieldDTO getFieldById(Long fieldId) {
        return fieldRepository.findById(fieldId).map(FieldDTO::new)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
    }

    public List<FieldDTO> getAllFields() {
        return fieldRepository.findAll().stream().map(FieldDTO::new).collect(Collectors.toList());
    }

    public List<FieldDTO> getFieldsByOwner(String ownerEmail) {
        User user = userService.getUserByEmail(ownerEmail);
        if (user == null) {
            throw new EntityNotFoundException("User not found with email: " + ownerEmail);
        }

        return fieldRepository.findByOwnerId(user.getId()).stream().map(FieldDTO::new).collect(Collectors.toList());
    }

    public List<FieldDTO> getFieldsByZone(UserZones zone) {
        return fieldRepository.findByZone(zone).stream().map(FieldDTO::new).collect(Collectors.toList());
    }

    public List<FieldDTO> getFieldByName(String name) {
        return fieldRepository.findByName(name).stream().map(FieldDTO::new).collect(Collectors.toList());
    }

    public List<FieldDTO> getFieldsByFeature(FieldFeatures feature) {
        return fieldRepository.findByFeaturesContaining(feature).stream().map(FieldDTO::new)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsByFieldId(Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        return field.getReviews().stream()
                .map(reviewRepository::findById)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .map(ReviewDTO::new)
                .collect(Collectors.toList());
    }

    public List<ReservationDTO> getReservationsByFieldId(Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        return reservationRepository.findByFieldId(field.getId()).stream()
                .map(ReservationDTO::new)
                .collect(Collectors.toList());
    }

    public List<ReservationDTO> getReservationByOrganizerEmail(String organizerEmail) {
        return reservationRepository.findByOrganizerEmail(organizerEmail).stream()
                .map(ReservationDTO::new)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStaticticsByFieldId(Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        List<Reservation> reservations = reservationRepository.findByFieldId(fieldId);

        double weekly = field.getWeeklyOcupation(reservations);
        double monthly = field.getMonthlyOcupation(reservations);
        int totalReservations = reservations.stream().filter(r -> r.getDate().isAfter(LocalDate.now()))
                .collect(Collectors.toList()).size();
        totalReservations += reservations.stream().filter(r -> r.getDate().isEqual(LocalDate.now()))
                .collect(Collectors.toList()).size();

        Map<String, Object> response = new HashMap<>();
        response.put("weeklyOccupation", weekly);
        response.put("monthlyOccupation", monthly);
        response.put("totalReservations", totalReservations);

        return response;
    }

    public void deleteReservationByOwner(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found"));

        Field field = reservation.getField();
        User currentUser = getCurrentUser();

        if (!field.getOwner().getEmail().equals(currentUser.getEmail())) {
            throw new InvalidActionException("Solo el propietario del campo puede eliminar reservas");
        }

        field.removeReservation(reservationId);
        reservationRepository.deleteById(reservationId);

        fieldRepository.save(field);
    }

    public void deleteReservationByOrganizer(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found"));
        User currentUser = getCurrentUser();
        Field field = reservation.getField();

        if (!reservation.getOrganizer().getEmail().equals(currentUser.getEmail())) {
            throw new EntityNotFoundException("Solo el organizador de la reserva puede eliminarla");
        }

        field.removeReservation(reservationId);
        reservationRepository.deleteById(reservationId);

        fieldRepository.save(field);
    }

    // UPDATE
    public FieldDTO updateFieldDescription(Long fieldId, String description) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        field.setDescription(description);
        return new FieldDTO(fieldRepository.save(field));
    }

    public FieldDTO updateFieldFeatures(Long fieldId, ArrayList<FieldFeatures> features) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        field.setFeatures(features);
        return new FieldDTO(fieldRepository.save(field));
    }

    public FieldDTO updateFieldPrice(Long fieldId, Double price) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        field.setPrice(price);
        return new FieldDTO(fieldRepository.save(field));
    }

    public FieldDTO updateFieldImages(Long fieldId, ArrayList<String> images) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        field.setImages(images);
        return new FieldDTO(fieldRepository.save(field));
    }

    public ReviewDTO addReviewToField(ReviewCreateDTO reviewDTO) {
        Field field = fieldRepository.findById(reviewDTO.field_id())
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        Review review = reviewRepository.save(reviewDTO.asReview());
        field.addReview(review.getId());
        fieldRepository.save(field);
        return new ReviewDTO(review);
    }

    public ReservationDTO addReservationToField(ReservationCreateDTO reservation) {
        Field field = fieldRepository.findById(reservation.getFieldId())
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));

        if (reservation.getDate().isBefore(LocalDate.now()) || (reservation.getDate().isEqual(LocalDate.now()) && reservation.getStart().isBefore(LocalTime.now()))) {
            throw new IllegalArgumentException("Cannot reserve a field for a past date");
        }

        if (reservation.getStart().isAfter(reservation.getEnd())) {
            throw new IllegalArgumentException("Start hour must be before end hour");
        }


        if (field.getFieldSchedule().getStartHour().isAfter(reservation.getStart()) ||
                field.getFieldSchedule().getEndHour().isBefore(reservation.getEnd())) {
            throw new IllegalArgumentException("Reservation time slot is outside of field's schedule.");
        }

        List<Reservation> reservations = reservationRepository.findByFieldIdAndDate(field.getId(),
                reservation.getDate());
        if (reservations.stream().anyMatch(r -> r.getStart().isBefore(reservation.getEnd()) &&
                r.getEnd().isAfter(reservation.getStart()))) {
            throw new DuplicateEntityException("Reservation", "time slot");
        }

        if (field.getSchedule().getUnavailableTimeSlots().stream()
                .anyMatch(unavailable -> reservation.getStart().isBefore(unavailable.getEndHour()) &&
                        reservation.getEnd().isAfter(unavailable.getStartHour()))) {
            throw new DuplicateEntityException("Blocked slot", "time slot");
        }

        User organizer = userService.getUserByEmail(getCurrentUser().getEmail());
        Reservation newReservation = reservationRepository.save(reservation.asReservation(field, organizer));
        field.addReservation(newReservation);
        return new ReservationDTO(newReservation);
    }

    public List<String> getAvailableSlotsForReservations(LocalDate date, Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        List<Reservation> reservations = reservationRepository.findByFieldIdAndDate(fieldId, date);
        List<TimeSlot> timeSlots = field.getSchedule().getTimeSlotsForDate(date, reservations);

        return timeSlots.stream()
                .map(slot -> slot.getStartHour() + " - " + slot.getEndHour())
                .collect(Collectors.toList());
    }

    public FieldDTO addUnavailbleTimeSlotToField(Long fieldId, TimeSlotDTO timeSlot) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));

        User currentUser = getCurrentUser();
        if (!field.getOwner().getEmail().equals(currentUser.getEmail())) {
            throw new InvalidActionException("Solo el propietario del campo puede editarlo");
        }

        TimeSlot timeSlotEntity = timeSlot.asTimeSlot();
        List<Reservation> reservations = reservationRepository.findByFieldIdAndDate(fieldId, timeSlotEntity.getDate());
        if (reservations.stream()
                .anyMatch(reservation -> timeSlotEntity.getStartHour().isBefore(reservation.getEnd()) &&
                        timeSlotEntity.getEndHour().isAfter(reservation.getStart()))) {
            throw new DuplicateEntityException("Reservation", "time slot");
        }

        if (field.getSchedule().getUnavailableTimeSlots().stream()
                .anyMatch(unavailable -> timeSlotEntity.getStartHour().isBefore(unavailable.getEndHour()) &&
                        timeSlotEntity.getEndHour().isAfter(unavailable.getStartHour()))) {
            throw new DuplicateEntityException("Blocked Timeslot", "time");
        }

        field.getSchedule().addUnavailableTimeSlot(timeSlotEntity);

        return new FieldDTO(fieldRepository.save(field));
    }

    // edit field
    public FieldDTO updateField(Long fieldId, FieldUpdateDTO fieldEdit) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found"));
        User currentUser = getCurrentUser();
        if (!field.getOwner().getEmail().equals(currentUser.getEmail())) {
            throw new InvalidActionException("Solo el propietario del campo puede editarlo");
        }

        if (fieldEdit.getDescription() != null) {
            field.setDescription(fieldEdit.getDescription());
        }

        if (fieldEdit.getLocation() != null) {
            field.setLocation(fieldEdit.getLocation());
        }

        if (fieldEdit.getZone() != null) {
            field.setZone(fieldEdit.getZone());
        }

        if (fieldEdit.getPrice() != null) {
            field.setPrice(fieldEdit.getPrice().doubleValue());
        }

        if (fieldEdit.getFeatures() != null) {
            field.setFeatures(fieldEdit.getFeatures().stream()
                    .map(FieldFeatures::valueOf)
                    .collect(Collectors.toList()));
        }

        if (fieldEdit.getImages() != null) {
            field.setImages(fieldEdit.getImages());
        }

        if (fieldEdit.getName() != null) {
            field.setName(fieldEdit.getName());
        }

        if (fieldEdit.schedule() != null) {
            FieldSchedule schedule = field.getSchedule();
            FieldScheduleCreateDTO scheduleDTO = fieldEdit.schedule();

            if (scheduleDTO.getDays() != null) {
                schedule.setDays(scheduleDTO.getDays());
            }

            if (scheduleDTO.getStartHour() != null) {
                schedule.setStartHour(scheduleDTO.getStartHour());
            }

            if (scheduleDTO.getEndHour() != null) {
                schedule.setEndHour(scheduleDTO.getEndHour());
            }

            if (schedule.getStartHour().isAfter(schedule.getEndHour())) {
                throw new IllegalArgumentException("Start hour must be before end hour");
            }

            if (scheduleDTO.getPredefDuration() != null) {
                schedule.setPredefDuration(scheduleDTO.getPredefDuration());
            }
        }

        return new FieldDTO(fieldRepository.save(field));
    }

    public Reservation getReservationById(Long id) {
        return reservationRepository.getReferenceById(id);
    }

}