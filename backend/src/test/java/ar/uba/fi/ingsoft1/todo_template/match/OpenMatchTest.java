package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldFeatures;
import ar.uba.fi.ingsoft1.todo_template.match.participationType.Open;
import ar.uba.fi.ingsoft1.todo_template.match.participationType.ParticipationType;
import ar.uba.fi.ingsoft1.todo_template.reservation.Reservation;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserZones;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;

public class OpenMatchTest {
    private Validator validator;

    @Before
    public void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private Match buildValidMatch() {
        User user = new User(
                "Juan", "Pérez", "juan.perez@example.com", List.of(UserZones.AVELLANEDA), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        Field field = new Field(
                user, "Cancha de Prueba",
                "Calle 123",
                UserZones.AVELLANEDA,
                List.of(FieldFeatures.GRASS, FieldFeatures.WIFI, FieldFeatures.PARKING),
                List.of("https://example.com/image1.jpg", "https://example.com/image2.jpg")
        );

        ParticipationType pt = new Open(2,6, new HashSet<>());
        Reservation reserv = new Reservation(field, LocalDate.now(), LocalTime.now().plusHours(1), LocalTime.now().plusHours(2), user);

        return new Match(
                pt,
                reserv
        );
    }

    @Test
    public void testValidMatch() {
        Match match = buildValidMatch();
        Set<ConstraintViolation<Match>> violations = validator.validate(match);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testJoinWhenActive() {
        Match match = buildValidMatch();
        User newUser = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        assertTrue(  match.join(newUser));
    }

    @Test
    public void testCloseWithoutEnoughPlayersThrowsException() {
        Match match = buildValidMatch();
        IllegalStateException ex = assertThrows(IllegalStateException.class, match::close);
        assertEquals("Not enough players!", ex.getMessage());
    }

    @Test
    public void testCloseMinPlayers() {
        Match match = buildValidMatch();
        User newUser1 = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser2 = new User(
                "Luis", "Heizenberg", "batman14@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        match.join(newUser1);
        match.join(newUser2);
        match.close();
        assertEquals("Closed", match.getState());
    }


    @Test
    public void testJoinWhenNotActiveThrowsException() {
        Match match = buildValidMatch();
        User newUser1 = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser2 = new User(
                "Luis", "Heizenberg", "batman14@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser3 = new User(
                "Luis", "Heizenberg", "joseLuis@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        match.join(newUser1);
        match.join(newUser2);
        match.close();
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> match.join(newUser3));
        assertEquals("Cannot join match", ex.getMessage());
    }

    @Test
    public void testLeaveMatchWhenActive() {
        Match match = buildValidMatch();
        User newUser1 = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser2 = new User(
                "Luis", "Heizenberg", "batman14@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        match.join(newUser1);
        match.join(newUser2);
        assertTrue(match.leaveMatch(newUser1));
    }

    @Test
    public void testLeaveMatchWhenNotActiveThrowsException() {
        Match match = buildValidMatch();
        User newUser1 = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser2 = new User(
                "Luis", "Heizenberg", "batman14@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        match.join(newUser1);
        match.join(newUser2);
        match.close();
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> match.leaveMatch(newUser2));
        assertEquals("Cannot leave match", ex.getMessage());
    }

    @Test
    public void testCloseWhenNotActiveThrowsException() {
        Match match = buildValidMatch();
        User newUser1 = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser2 = new User(
                "Luis", "Heizenberg", "batman14@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        match.join(newUser1);
        match.join(newUser2);
        match.close();
        IllegalStateException ex = assertThrows(IllegalStateException.class, match::close);
        assertEquals("Cannot close match", ex.getMessage());
    }

    @Test
    public void testStartWhenClosed() {
        Match match = buildValidMatch();
        User newUser1 = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser2 = new User(
                "Luis", "Heizenberg", "batman14@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        match.join(newUser1);
        match.join(newUser2);
        match.close();
        match.start();
        assertEquals("Started", match.getState());
    }

    @Test
    public void testStartWhenNotClosedThrowsException() {        Match match = buildValidMatch();
        User newUser1 = new User(
                "Lolo", "Gonzalez", "lolo15@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        User newUser2 = new User(
                "Luis", "Heizenberg", "batman14@example.com", List.of(UserZones.PALERMO), "123456", "hombre","http://example.com/photo.jpg", (short) 30
        );
        match.join(newUser1);
        match.join(newUser2);
        IllegalStateException ex = assertThrows(IllegalStateException.class, match::start);
        assertEquals("Cannot start match yet", ex.getMessage());
    }

}
