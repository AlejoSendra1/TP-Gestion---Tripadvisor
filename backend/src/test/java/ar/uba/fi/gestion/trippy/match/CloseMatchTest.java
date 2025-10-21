package ar.uba.fi.gestion.trippy.match;

import ar.uba.fi.gestion.trippy.field.Field;
import ar.uba.fi.gestion.trippy.field.FieldFeatures;
import ar.uba.fi.gestion.trippy.match.participationType.Close;
import ar.uba.fi.gestion.trippy.match.participationType.ParticipationType;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.team.Team;
import ar.uba.fi.gestion.trippy.user.User;
import ar.uba.fi.gestion.trippy.user.UserZones;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;

public class CloseMatchTest {
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

        Team teama = new Team("equipo a","Messi");
        Team teamb = new Team("equipo b", "Shaggy");

        ParticipationType pt = new Close(teama,teamb);
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
        UnsupportedOperationException ex = assertThrows(UnsupportedOperationException.class, () -> match.join(newUser));
        assertEquals("Operation not supported.", ex.getMessage());
    }

    @Test
    public void testStartWhenClosed() {
        Match match = buildValidMatch();
        match.close();
        match.start();
        assertEquals("Started", match.getState());
    }

    @Test
    public void testStartWhenNotClosedThrowsException() {
        Match match = buildValidMatch();
        IllegalStateException ex = assertThrows(IllegalStateException.class, match::start);
        assertEquals("Cannot start match yet", ex.getMessage());
    }

}
