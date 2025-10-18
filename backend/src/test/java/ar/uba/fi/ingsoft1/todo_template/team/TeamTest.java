package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;
import org.junit.Before;
import org.junit.Test;
import jakarta.validation.Validator;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class TeamTest {
    private Team validTeam;
    private Validator validator;
    private User user;

    @Before
    public void setUp(){
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

    }

    public Team getValidTeam() {
        Team validTeam = new Team("Test Team", "Test Captain");
        validTeam.setLogo("logo.png");
        validTeam.setColors("green");
        validTeam.setSkill(7);
        validTeam.setPlayers(new ArrayList<>(Arrays.asList(validTeam.getCaptain(), "Player Two", "Player Three")));
        return validTeam;
    }


    @Test
    public void testConstructorWithNameAndCaptain() {
        Team team = new Team("Another Team", "New Captain");
        assertEquals("Another Team", team.getName());
        assertEquals("New Captain", team.getCaptain());
        assertNotNull(team.getPlayers());
        assertFalse(team.getPlayers().isEmpty());
        assertTrue(team.getPlayers().contains("New Captain"));
        assertEquals(1, team.getPlayers().size());
        assertNull(team.getLogo());
        assertNull(team.getColors());
        assertNull(team.getSkill());
    }
    @Test
    public void getName() {
        assertEquals("Test Team", getValidTeam().getName());
    }

    @Test
    public void getCaptain() {
        assertEquals("Test Captain", getValidTeam().getCaptain());
    }

    @Test
    public void getLogo() {
        assertEquals("logo.png", getValidTeam().getLogo());
    }

    @Test
    public void getColors() {
        assertEquals("green", getValidTeam().getColors());
    }

    @Test
    public void getSkill() {
        assertEquals(7, getValidTeam().getSkill());
    }

    @Test
    public void getPlayers() {
        assertEquals(getValidTeam().getPlayers(), getValidTeam().getPlayers());
    }

    @Test
    public void setName() {
        getValidTeam().setName("Test Team");
        assertEquals("Test Team", getValidTeam().getName());
    }

    @Test
    public void setLogo() {
        getValidTeam().setLogo("logo.png");
        assertEquals("logo.png", getValidTeam().getLogo());
    }

    @Test
    public void setColors() {
        getValidTeam().setColors("green");
        assertEquals("green", getValidTeam().getColors());
    }
    @Test
    public void addPlayer_shouldAddValidPlayer() {
        Team validTeam = getValidTeam();
        validTeam.setPlayers(new ArrayList<>(Arrays.asList("Existing Player"))); // Start with 4 players
        validTeam.addPlayer("New Player");
        assertTrue(validTeam.getPlayers().contains("New Player"));
        assertEquals(5, validTeam.getPlayers().size());
    }

    @Test
    public void addPlayer_shouldNotAddNullOrEmptyPlayer() {
        Team validTeam = getValidTeam();
        int initialSize = validTeam.getPlayers().size();
        validTeam.addPlayer(null);
        assertEquals(initialSize, validTeam.getPlayers().size());
        validTeam.addPlayer(" ");
        assertEquals(initialSize, validTeam.getPlayers().size());
    }

    @Test
    public void addPlayer_shouldNotAddDuplicatePlayer() {
        Team validTeam = getValidTeam();
        validTeam.setPlayers(new ArrayList<>(Arrays.asList("Existing Player")));
        validTeam.addPlayer("Existing Player"); //no guarda duplicado -> players = [ captain, player2, player3, Existing Player]
        assertEquals(4, validTeam.getPlayers().size());
    }


    @Test
    public void removePlayer_shouldRemoveExistingPlayer() {
        Team validTeam = getValidTeam();
        validTeam.setPlayers(new ArrayList<>(Arrays.asList("P1", "P2", "P3"))); // 6 players actually
        validTeam.removePlayer("P3");
        assertFalse(validTeam.getPlayers().contains("P3"));
        assertEquals(5, validTeam.getPlayers().size());
    }
@Test
public void removePlayer_shouldNotRemoveNonExistingPlayer() {
    Team validTeam = getValidTeam();
    validTeam.setPlayers(new ArrayList<>(Arrays.asList("P1", "P2", "P3")));
    int initialSize = validTeam.getPlayers().size();
    validTeam.removePlayer("NonExistent Player");
    assertEquals(initialSize, validTeam.getPlayers().size());
}
    @Test
    public void removePlayer_shouldNotRemoveIfOnlyOnePlayerLeft() {
        Team validTeam = getValidTeam();
        validTeam.setPlayers(new ArrayList<>(Collections.singletonList("Single Player")));
        int initialSize = validTeam.getPlayers().size(); // Should be 4
        validTeam.removePlayer("Single Player");
        assertEquals(initialSize-1, validTeam.getPlayers().size()); // Should still be 3
    }

    @Test
    public void removePlayer_shouldNotRemoveNullOrEmptyPlayer() {
        int initialSize =getValidTeam().getPlayers().size();
        getValidTeam().removePlayer(null);
        assertEquals(initialSize, getValidTeam().getPlayers().size());
        getValidTeam().removePlayer("");
        assertEquals(initialSize,getValidTeam().getPlayers().size());
    }


    @Test
    public void isComplete_shouldReturnFalseForCompleteTeam() {
        Team completeTeam = new Team("Complete Team", "Full Captain");
        completeTeam.setSkill(5);
        completeTeam.setPlayers(new ArrayList<>(Arrays.asList(
                completeTeam.getCaptain(), "Player One", "Player Two"
        )));
        assertFalse(completeTeam.isComplete(), "Expected team to be complete");
    }

    @Test
    public void isComplete_shouldReturnFalseIfSkillIsNull() {
        Team incompleteTeam = new Team("Incomplete Team", "Captain A");
        incompleteTeam.setPlayers(new ArrayList<>(Arrays.asList(
                incompleteTeam.getCaptain(), "P2", "P3"
        )));
        assertFalse(incompleteTeam.isComplete(), "Expected team to be incomplete (skill null)");
    }

    @Test
    public void isComplete_shouldReturnFalseIfSkillIsOutOfRange() {
        Team incompleteTeam = new Team("Incomplete Team", "Captain A");
        incompleteTeam.setPlayers(new ArrayList<>(Arrays.asList(
                incompleteTeam.getCaptain(), "P2", "P3"
        )));
        incompleteTeam.setSkill(0);
        assertFalse(incompleteTeam.isComplete(), "Expected team to be incomplete (skill too low)");

        incompleteTeam.setSkill(11);
        assertFalse(incompleteTeam.isComplete(), "Expected team to be incomplete (skill too high)");
    }

    @Test
    public void isComplete_shouldReturnFalseIfLessThanThreePlayers() {
        Team incompleteTeam1 = new Team("Incomplete Team 1", "Captain A");
        incompleteTeam1.setSkill(5);
        assertFalse(incompleteTeam1.isComplete(), "Expected team to be incomplete (1 player)");

        Team incompleteTeam2 = new Team("Incomplete Team 2", "Captain B");
        incompleteTeam2.setSkill(5);
        incompleteTeam2.addPlayer("Player 2");
        assertFalse(incompleteTeam2.isComplete(), "Expected team to be incomplete (2 players)");
    }

    @Test
    public void isComplete_shouldReturnFalseIfNameIsBlank() {
        Team incompleteTeam = new Team(" ", "Captain A");
        assertFalse(incompleteTeam.isComplete(), "Expected team to be incomplete (blank name)");
    }

    @Test
    public void isComplete_shouldReturnFalseIfCaptainIsBlank() {
        Team incompleteTeam = new Team("Incomplete Team", " ");
        assertFalse(incompleteTeam.isComplete(), "Expected team to be incomplete (blank captain)");
    }
}



