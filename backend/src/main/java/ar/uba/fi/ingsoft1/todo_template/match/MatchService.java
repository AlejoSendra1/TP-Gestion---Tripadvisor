package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.common.exception.InvalidActionException;
import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.match.matchOrganizer.MatchOrganizerService;
import ar.uba.fi.ingsoft1.todo_template.match.participationType.ParticipationType;
import ar.uba.fi.ingsoft1.todo_template.match.participationType.ParticipationTypeService;
import ar.uba.fi.ingsoft1.todo_template.reservation.Reservation;
import ar.uba.fi.ingsoft1.todo_template.reservation.ReservationDTO;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import ar.uba.fi.ingsoft1.todo_template.field.FieldService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserService userService;
    private final ParticipationTypeService participationTypeService;
    private final MatchOrganizerService matchOrganizerService;
    private final FieldService fieldService;

    public MatchService(MatchRepository matchRepository, UserService userService,
            ParticipationTypeService participationTypeService, FieldService fieldService, MatchOrganizerService matchOrganizerService) {
        this.matchRepository = matchRepository;
        this.userService = userService;
        this.participationTypeService = participationTypeService;
        this.matchOrganizerService = matchOrganizerService;
        this.fieldService = fieldService;
    }

    public MatchDTO createMatch(MatchCreateDTO matchCreateDTO) {
        Match newMatch = buildMatch(matchCreateDTO);
        Match savedMatch = matchRepository.save(newMatch);
        matchOrganizerService.create();
        return new MatchDTO(savedMatch);
    }

    private Match buildMatch(MatchCreateDTO matchCreateDTO) {
        ParticipationType partType = participationTypeService.buildFromDTO(matchCreateDTO.getParticipationType());

        ReservationDTO reservationDTO = fieldService.addReservationToField(matchCreateDTO.getReservation());
        Reservation reservation = fieldService.getReservationById(reservationDTO.getId());

        return matchCreateDTO.asMatch(partType, reservation);
    }

    public void deleteMatch(Long id) {
        Match match = matchRepository.findById(id).orElse(null);
        if (match != null && match.isOrganizer(userService.getUserByEmail(getUserEmail()))) {
            matchRepository.deleteById(id);
        }

        fieldService.deleteReservationByOrganizer(match.getReservation().getId());
    }

    public MatchDTO updateMatch(Long id, MatchCreateDTO matchCreateDTO) {
        Match existingMatch = matchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Match not found"));

        ParticipationType newPartType = participationTypeService.buildFromDTO(matchCreateDTO.getParticipationType());
        participationTypeService.updateParticipationType(existingMatch.getParticipationType(),
                newPartType);
        existingMatch.setParticipationType(newPartType);

        return new MatchDTO(matchRepository.save(existingMatch));
    }

    MatchDTO getMatch(Long id) {
        Optional<Match> MatchFound = matchRepository.findById(id);
        MatchDTO MatchFoundDTO;
        try {
            MatchFoundDTO = new MatchDTO(MatchFound.get());
        } catch (Exception e) {
            throw new EntityNotFoundException(e);
        }

        return MatchFoundDTO;
    }

    public MatchDTO joinMatch(Long id) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        String email = userDetails.username();
        Match match = getMatchById(id);
        User user = userService.getUserByEmail(email);

        if (!match.join(user)) {
            throw new InvalidActionException("Can't join match");
        }

        Match savedMatch = matchRepository.save(match);
        matchOrganizerService.addPlayer(match.getId(), user.getId());
        return new MatchDTO(savedMatch);
    }

    public void leaveMatch(Long id) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        String email = userDetails.username();
        Match match = getMatchById(id);
        User user = userService.getUserByEmail(email);

        if (!match.leaveMatch(user)) {
            throw new InvalidActionException("Can't leave match");
        }
        matchOrganizerService.removePlayer(match.getId(), user.getId());
        matchRepository.save(match);
    }

    public void closeMatch(Long id) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        String email = userDetails.username();
        Match match = getMatchById(id);

        if (!match.isOrganizer(userService.getUserByEmail(email))) {
            throw new InvalidActionException("You don't have permissions to close the match");
        }
        ParticipationType participationType = match.getParticipationType();
        if (participationType.getPlayerCount() < participationType.getMinPlayersCount()) {
            throw new InvalidActionException("The match does not have enough players to close");

        }
        match.close();
        matchRepository.save(match);
    }

    public MatchDTO startMatch(Long id) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        String email = userDetails.username();
        Match match = getMatchById(id);

        if (!match.isOrganizer(userService.getUserByEmail(email))) {
            throw new InvalidActionException("You don't have permissions to start the match");
        }
        matchOrganizerService.finish(match.getId());
        match.start();
        return new MatchDTO(match);
    }

    private Match getMatchById(Long id) {
        Optional<Match> matchFound = matchRepository.findById(id);
        if (matchFound.isEmpty()) {
            throw new EntityNotFoundException("Match not found");
        }
        return matchFound.get();
    }

    public Page<MatchDTO> getSelfOrganizedMatches(@Valid Pageable pageable) {
        return matchRepository.findAllMatchesOrganizedByActualUser(pageable, getUserEmail()).map(MatchDTO::new);
    }

    public Page<MatchDTO> getMatchesActualPlayerParticipatesIn(@Valid Pageable pageable) {
        String email = getUserEmail();

        // Open Matches where the user is in
        Page<Match> openMatches = matchRepository.findAllOpenMatchesTheUserIsIn(pageable, userService.getUserByEmail(getUserEmail()).getId());

        // Matches where the user is in a Team
        Page<Match> closeMatches = matchRepository.findAllCloseMatchesTheUserIsIn(pageable, email);

        List<Match> allMatches = new ArrayList<>();
        allMatches.addAll(openMatches.getContent());
        allMatches.addAll(closeMatches.getContent());

        // Sort by date and time from reservation
        allMatches.sort(Comparator
                .comparing((Match m) -> m.getReservation().getDate())
                .thenComparing(m -> m.getReservation().getStart()));

        // Apply manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allMatches.size());
        List<MatchDTO> pagedMatches = allMatches.subList(start, end).stream().map(MatchDTO::new).toList();

        return new PageImpl<>(pagedMatches, pageable, allMatches.size());
    }

    public Page<MatchDTO> getAllAvailableMatches(@Valid Pageable pageable) {
        return matchRepository.findAllWithOpenParticipation(pageable).map(MatchDTO::new);
    }

    private String getUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        return userDetails.username();
    }

}
