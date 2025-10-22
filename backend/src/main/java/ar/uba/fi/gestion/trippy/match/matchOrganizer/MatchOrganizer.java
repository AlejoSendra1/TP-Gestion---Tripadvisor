package ar.uba.fi.gestion.trippy.match.matchOrganizer;

import ar.uba.fi.gestion.trippy.common.exception.InvalidActionException;
import jakarta.persistence.*;

import java.io.Serializable;
import java.util.*;

@Entity
@Table(name = "matches_teams")
public class MatchOrganizer implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "match_available_players", joinColumns = @JoinColumn(name = "match_organizer_id"))
    @Column(name = "player_id")
    private Set<Long> availablePlayers;

    @ElementCollection
    @CollectionTable(name = "match_team_a_players", joinColumns = @JoinColumn(name = "match_organizer_id"))
    @Column(name = "player_id")
    private Set<Long> teamAPlayers;

    @ElementCollection
    @CollectionTable(name = "match_team_b_players", joinColumns = @JoinColumn(name = "match_organizer_id"))
    @Column(name = "player_id")
    private Set<Long> teamBPlayers;

    public MatchOrganizer() {
        this.availablePlayers = new HashSet<>();
        this.teamAPlayers = new HashSet<>();
        this.teamBPlayers = new HashSet<>();
    }

    public Set<Long> getAvailablePlayers() {return this.availablePlayers;}

    public Set<Long> getTeamAPlayers() { return this.teamAPlayers; }

    public Set<Long> getTeamBPlayers() { return this.teamBPlayers; }

    public void addPlayer(Long playerId) {
        this.availablePlayers.add(playerId);
    }
    public void removePlayer(Long playerId) {
        this.availablePlayers.remove(playerId);
    }

    public void movePlayer(Long id, Short team){
        // 0 team A, 1 AvailablePlayers, 2 teamB
        if (team == 0){
            availablePlayers.remove(id);
            teamBPlayers.remove(id);
            teamAPlayers.add(id);
        }
        if (team == 1){
            availablePlayers.add(id);
            teamAPlayers.remove(id);
            teamBPlayers.remove(id);
        }
        if (team == 2){
            availablePlayers.remove(id);
            teamAPlayers.remove(id);
            teamBPlayers.add(id);
        }
    }

    public void finish(){
        if (!this.availablePlayers.isEmpty()){
            throw new InvalidActionException("You need to asign all players before starting");
        }
        if (this.teamAPlayers.size() != this.teamBPlayers.size()){
            throw new InvalidActionException("Both teams need to have the same number of players");
        }
    }

    public void generateRandomTeams(){
        List<Long> listAvailablePlayers = new ArrayList<>(availablePlayers);
        Collections.shuffle(listAvailablePlayers);

        int halfSize = listAvailablePlayers.size() / 2;

        teamAPlayers.clear();
        teamBPlayers.clear();

        teamAPlayers.addAll(listAvailablePlayers.subList(0, halfSize));
        teamBPlayers.addAll(listAvailablePlayers.subList(halfSize, listAvailablePlayers.size()));

        availablePlayers.clear();
    }
}
