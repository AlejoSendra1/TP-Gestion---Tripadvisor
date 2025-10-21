package ar.uba.fi.gestion.trippy.match;

import ar.uba.fi.gestion.trippy.match.participationType.ParticipationType;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TestMatch {

    private ParticipationType participationType;
    private Reservation reservation;
    private User user;
    private Match match;

    @BeforeEach
    void setUp() {
        participationType = mock(ParticipationType.class);
        reservation = mock(Reservation.class);
        user = mock(User.class);
        match = new Match(participationType, reservation);
    }

    @Test
    void testMatchCreation() {
        assertEquals("Active", match.getState());
        assertEquals(participationType, match.getParticipationType());
        assertEquals(reservation, match.getReservation());
    }

    @Test
    void testIsOrganizerReturnsTrue() {
        when(reservation.getOrganizer()).thenReturn(user);
        assertTrue(match.isOrganizer(user));
    }

    @Test
    void testIsOrganizerReturnsFalse() {
        User anotherUser = mock(User.class);
        when(reservation.getOrganizer()).thenReturn(user);
        assertFalse(match.isOrganizer(anotherUser));
    }

    @Test
    void testCloseMatchSuccess() {
        doNothing().when(participationType).checkStart();

        match.close();

        assertEquals("Closed", match.getState());
        verify(participationType).checkStart();
    }

    @Test
    void testCloseMatchWhenNotActiveThrowsException() {
        match.close();
        Exception ex = assertThrows(IllegalStateException.class, match::close);
        assertEquals("Cannot close match", ex.getMessage());
    }

    @Test
    void testStartMatchSuccess() {
        doNothing().when(participationType).checkStart();
        match.close();
        match.start();
        assertEquals("Started", match.getState());
    }

    @Test
    void testStartMatchWhenNotClosedThrowsException() {
        Exception ex = assertThrows(IllegalStateException.class, match::start);
        assertEquals("Cannot start match yet", ex.getMessage());
    }

    @Test
    void testJoinMatchSuccess() {
        when(participationType.addPlayer(user)).thenReturn(true);
        assertTrue(match.join(user));
    }

    @Test
    void testJoinMatchWhenNotActiveThrowsException() {
        match.close();
        Exception ex = assertThrows(IllegalStateException.class, () -> match.join(user));
        assertEquals("Cannot join match", ex.getMessage());
    }

    @Test
    void testLeaveMatchSuccess() {
        when(participationType.leaveMatch(user)).thenReturn(true);
        assertTrue(match.leaveMatch(user));
    }

    @Test
    void testLeaveMatchWhenNotActiveThrowsException() {
        match.close();
        Exception ex = assertThrows(IllegalStateException.class, () -> match.leaveMatch(user));
        assertEquals("Cannot leave match", ex.getMessage());
    }
}
