package ar.uba.fi.ingsoft1.todo_template.team;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.Before;

import org.junit.Test;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class TeamCreateDTOTest {
    private Validator validator;
    private TeamCreateDTO buildDTO(String name, String logo, String colors, Integer skill, String[] players) {
        return new TeamCreateDTO(name, logo, colors, skill, players);
    }

    @Before
    public void setUp(){
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }
    @Test
    public void testCreateTeamOnlyName() {
        TeamCreateDTO dto = buildDTO("Los locos", null, null, null, null);
        Set<ConstraintViolation<TeamCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }
    @Test
    public void testValidTeamCreateDTO() {
       TeamCreateDTO dto = buildDTO("", "", "",0 , new String[]{});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertFalse(constraintViolations.isEmpty());
    }

    @Test
    public void testNullNameFailsValidation() {
        TeamCreateDTO dto = buildDTO(null, "logo.png", "red", 5, new String[]{"user@example.com"});
        Set<ConstraintViolation<TeamCreateDTO>> violations = validator.validate(dto);
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    public void testEmptyNameFailsValidation() {
        TeamCreateDTO dto = buildDTO("", "logo.png", "red", 5, new String[]{});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertFalse(constraintViolations.isEmpty());
    }

    @Test
    public void testNullLogoPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", null, "red", 5, new String[]{"user@example.com"});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.isEmpty());

    }
    @Test
    public void testEmptyLogoPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", "", "red", 5, new String[]{"user@example.com"});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.isEmpty());
    }

    @Test
    public void testNullColorPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", "logo.png", null, 5, new String[]{"user@example.com"});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.isEmpty());
    }
    @Test
    public void testEmptyColorPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", "logo.png", "", 5, new String[]{"user@example.com"});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.isEmpty());
    }

    @Test
    public void testNullSkillPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", "logo.png", "red", null, new String[]{"user@example.com"});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.isEmpty());
    }
    @Test
    public void testEmptySkillPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", "logo.png", "red",0 , new String[]{"user@example.com"});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("skill")));
    }
    @Test
    public void testNullPlayerPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", "logo.png", "red", 5, null);
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.isEmpty());
    }
    @Test
    public void testEmptyPlayerPassesValidation() {
        TeamCreateDTO dto = buildDTO("Los lobos", "logo.png", "red", 5, new String[]{});
        Set<ConstraintViolation<TeamCreateDTO>> constraintViolations = validator.validate(dto);
        assertTrue(constraintViolations.isEmpty());
    }

}