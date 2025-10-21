package ar.uba.fi.gestion.trippy.team;

import org.junit.Before;


import static org.junit.jupiter.api.Assertions.*;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.util.List;
import java.util.Set;
import org.junit.Test;

public class TeamDTOTest {
    private Validator validator;
    @Before
    public void setUp(){
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }


    @Test
    public void testConstructorFromTeamCopiesAllFields() {
        Team team = new Team("Lobos", "Juan Lopez");
        team.setLogo("logo.png");
        team.setColors("Verde");
        team.setSkill(9);
        team.setPlayers(List.of("jugador1@example.com", "jugador2@example.com"));

        TeamDTO dto = new TeamDTO(team);

        assertEquals("Lobos", dto.name());
        assertEquals("Juan Lopez", dto.captain());
        assertEquals("logo.png", dto.logo());
        assertEquals("Verde", dto.colors());
        assertEquals(Integer.valueOf(9), dto.skill());
        assertArrayEquals(new String[]{dto.captain(),"jugador1@example.com", "jugador2@example.com"}, dto.players());
    }

    @Test
    public void testAsTeamReturnsEquivalentTeam() {
        TeamDTO dto = new TeamDTO(
                "Lobos", "Juan Lopez", "logo.png", "Rojo", 7,
                new String[]{"jugador1@example.com", "jugador2@example.com"}
        );

        Team team = dto.asTeam();

        assertEquals("Lobos", team.getName());
        assertEquals("Juan Lopez", team.getCaptain());
        assertEquals("logo.png", team.getLogo());
        assertEquals("Rojo", team.getColors());
        assertEquals(Integer.valueOf(7), team.getSkill());
        assertEquals(List.of(team.getCaptain(),"jugador1@example.com", "jugador2@example.com"), team.getPlayers());
    }

//    @Test
//    public void testAsTeamWithNullPlayersReturnsEmptyList() {
//        TeamDTO dto = new TeamDTO(
//                "Lobos", "Juan Lopez", "logo.png", "Rojo", 7, null
//        );
//
//        Team team = dto.asTeam();
//        assertNotNull(team.getPlayers());
//        assertEquals(1, team.getPlayers().size());
//        assertEquals("Juan Lopez", team.getPlayers().get(0));
//    }

    @Test
    public void testAsTeamWithEmptyPlayersArray() {
        TeamDTO dto = new TeamDTO(
                "Lobos", "Juan Lopez", "logo.png", "Rojo", 7, new String[]{}
        );

        Team team = dto.asTeam();

        assertNotNull(team.getPlayers());
        //si no hay jugadores esta unicamenre el capitan del equipo
        assertFalse(team.getPlayers().isEmpty());
    }

    @Test
    public void testSkillValidationFailsOnNegative() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        TeamDTO dto = new TeamDTO("Lobos", "Juan", "logo.png", "Rojo", -5, new String[]{"a"});
        Set<ConstraintViolation<TeamDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("skill")));
    }

    @Test
    public void testSkillValidationPassesWhenNull() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        TeamDTO dto = new TeamDTO("Lobos", "Juan", "logo.png", "Rojo", null, new String[]{"a"});
        Set<ConstraintViolation<TeamDTO>> violations = validator.validate(dto);

        assertTrue(violations.isEmpty()); // @Positive no aplica si el valor es null
    }
}

