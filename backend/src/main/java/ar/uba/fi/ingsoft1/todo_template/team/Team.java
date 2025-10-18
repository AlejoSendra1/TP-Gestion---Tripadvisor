package ar.uba.fi.ingsoft1.todo_template.team;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.context.SecurityContextHolder;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import jakarta.persistence.*;

@Entity(name = "teams")
public class Team {
    @Id
    @Column(nullable = false, unique = true)
    @NotBlank
    private String name;

    @Column(nullable = false)
    @NotBlank
    private String captain;
    
    @Column(nullable = true)
    private String logo;

    @Column(nullable = true)
    private String colors;

    @Column(nullable = true)
    private Integer skill;

    @ElementCollection
    private List<String> players;

    public Team() {
        this.name = name;
        this.captain = getUser();
        this.logo = null;
        this.colors = null;
        this.skill = null;
        this.players = new ArrayList<>();
        this.players.add(captain);
    }
    public Team(String name) {
        this.name = name;
        this.captain = getUser();
        this.logo = null;
        this.colors = null;
        this.skill = null;
        this.players = new ArrayList<>();
        this.players.add(captain);
    }

    public Team(String name, String captain) {
        this.name = name;
        this.captain = captain;
        this.logo = null;
        this.colors = null;
        this.skill = null;
        this.players = new ArrayList<>();
        this.players.add(captain);
    }




    public String getName() {
        return name;
    }

    public String getCaptain() {
        return captain;
    }

    public String getLogo() {
        return logo;
    }

    public String getColors() {
        return colors;
    }

    public Integer getSkill() {
        return skill;
    }

    public List<String> getPlayers() {
        return players;
    }

    public void setName(String nombre) {
        this.name = nombre;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public void setColors(String colores) {
        this.colors = colores;
    }

    public void setSkill(Integer nivel) {
        this.skill = nivel;
    }

    public void setPlayers(List<String> players) {
        for (String player : players) {
            if (!this.isComplete() & player!= null & (player != " " )) {
                this.addPlayer(player);
            }
            else {
                break;
            }
        }
    }

    public boolean addPlayer(String player) {
        if (!this.players.contains(player) & (player != null) & (player != " " )  ) {
            this.players.add(player);
            return true;
        }
        return false;
    }

    public boolean removePlayer(String player) {
        if (this.players.contains(player)) {
            this.players.remove(player);
            return true;
        }
        return false;
    }

    public boolean isComplete() {
        return this.players.size() == 5;
    }

    private String getUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        JwtUserDetails userDetails = (JwtUserDetails) principal;
        return userDetails.username();
            
    }    
}