package ar.uba.fi.ingsoft1.todo_template.match.participationType;

import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamDTO;
import ar.uba.fi.ingsoft1.todo_template.team.TeamService;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;

@Service
public class ParticipationTypeService {

    private final TeamService teamService;
    private final UserService userService;

    public ParticipationTypeService(TeamService teamService, UserService userService) {
        this.teamService = teamService;
        this.userService = userService;
    }

    public ParticipationType buildFromDTO(ParticipationTypeDTO dto) {
        if (dto instanceof CloseDTO closeDTO) {
            Optional<TeamDTO> teamADTO = Optional.ofNullable(teamService.getTeam(closeDTO.getTeama()));
            Optional<TeamDTO> teamBDTO = Optional.ofNullable(teamService.getTeam(closeDTO.getTeamb()));
            if (teamADTO.isEmpty() || teamBDTO.isEmpty()){
                throw new IllegalArgumentException("Both teams must exist");
            }
            Team teama = teamADTO.get().asTeam();
            Team teamb = teamBDTO.get().asTeam();
            return new Close(teama, teamb);
        } else if (dto instanceof OpenDTO openDTO) {
            if (openDTO.getMinPlayersCount() > openDTO.getMaxPlayersCount()){
                throw new IllegalArgumentException("Minimum player count is bigger than the maximum player count");
            }
            HashSet<User> players = new HashSet<>();
            for(String email: openDTO.getPlayers()){
                players.add(userService.getUserByEmail(email));
            }

            return new Open(openDTO.getMinPlayersCount(), openDTO.getMaxPlayersCount(), players); // TODO deberia devolver algun error en casos de invalid players
        } else {
            throw new IllegalArgumentException("Unknown participation type");
        }
    }

    public void updateParticipationType(ParticipationType oldPartType,ParticipationType newPartType){
        newPartType.setId(oldPartType.getId());
    }
}
