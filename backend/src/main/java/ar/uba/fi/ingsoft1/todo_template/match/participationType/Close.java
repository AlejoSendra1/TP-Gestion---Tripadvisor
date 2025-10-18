package ar.uba.fi.ingsoft1.todo_template.match.participationType;


import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Close extends ParticipationType{

    @ManyToOne
    @JoinColumn(name = "TeamA", nullable = false)
    private Team teama;

    @ManyToOne
    @JoinColumn(name = "TeamB", nullable = false)
    private Team teamb;

    public Close(){}

    public Close(@NotBlank Team teama, @NotBlank Team teamb) {
        this.teama = teama;
        this.teamb = teamb;
    }

    public Team getTeama() {
        return teama;
    }

    public Team getTeamb() {
        return teamb;
    }

    @Override
    public String toString() {
        return "type: 'Close', teama: " + teama.getName() + "teamb: "+ teamb.getName();
    }

    @Override
    public boolean leaveMatch(User user) {
        throw new UnsupportedOperationException("Operation not supported.");
    }

    @Override
    public boolean addPlayer(User user){
        throw new UnsupportedOperationException("Operation not supported.");
    }

    @Override
    public Integer getMinPlayersCount() { throw new UnsupportedOperationException("Operation not supported."); }

    @Override
    public Integer getPlayerCount() { throw new UnsupportedOperationException("Operation not supported."); }

    public void checkStart() {}
}
