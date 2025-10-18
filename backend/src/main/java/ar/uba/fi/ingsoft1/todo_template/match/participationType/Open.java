package ar.uba.fi.ingsoft1.todo_template.match.participationType;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.HashSet;
import java.util.Set;


@Entity
public class Open extends ParticipationType {

    private Integer minPlayersCount;
    private Integer maxPlayersCount;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "open_players",
            joinColumns = @JoinColumn(name = "open_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> players;

    public Open(){}

    public Open(@Positive @NotNull Integer minPlayersCount, @Positive @NotNull Integer maxPlayersCount, HashSet<User> players) {
        this.maxPlayersCount = maxPlayersCount;
        this.minPlayersCount = minPlayersCount;
        this.players = players != null ? players : new HashSet<>();
    }

    @Override
    public Integer getMinPlayersCount() {
        return this.minPlayersCount;
    }

    public Integer getMaxPlayersCount() {
        return this.maxPlayersCount;
    }

    public Integer getPlayerCount() { return players.size(); }

    public Set<User> getPlayers() { return this.players; }

    @Override
    public String toString() {
        return "type: 'Open' minPlayersCount: " + minPlayersCount + "maxPlayersCount: "+ maxPlayersCount;
    }

    @Override
    public boolean addPlayer(User user) {
        if (players.size() == maxPlayersCount) {
            return false;
        }
        if (players.contains(user)) {
            return false;
        }
        players.add(user);
        return true;
    }

    @Override
    public boolean leaveMatch(User user) {
        if (!players.contains(user)) {
            return false;
        }
        players.remove(user);
        return true;
    }

    @Override
    public void checkStart(){
        if (players.size() < minPlayersCount){
            throw new IllegalStateException("Not enough players!");
        }
        if (players.size() % 2 != 0){
            throw new IllegalStateException("The number of players must be even!");
        }
    }



}
