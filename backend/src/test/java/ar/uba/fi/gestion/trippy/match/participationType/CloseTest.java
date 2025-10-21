package ar.uba.fi.gestion.trippy.match.participationType;

import ar.uba.fi.gestion.trippy.team.Team;
import ar.uba.fi.gestion.trippy.user.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CloseTest {

    @Test
    void testConstructorAndGetters() {
        Team teamA = mock(Team.class);
        Team teamB = mock(Team.class);

        Close close = new Close(teamA, teamB);

        assertEquals(teamA, close.getTeama());
        assertEquals(teamB, close.getTeamb());
    }

    @Test
    void testToStringIncludesTeamNames() {
        Team teamA = mock(Team.class);
        Team teamB = mock(Team.class);

        when(teamA.getName()).thenReturn("Los Halcones");
        when(teamB.getName()).thenReturn("Las Panteras");

        Close close = new Close(teamA, teamB);
        String result = close.toString();

        assertTrue(result.contains("Los Halcones"));
        assertTrue(result.contains("Las Panteras"));
        assertTrue(result.contains("type: 'Close'"));
    }

    @Test
    void testAddPlayerAlwaysReturnsFalse() {
        Close close = new Close(mock(Team.class), mock(Team.class));
        assertFalse(close.addPlayer(mock(User.class)));
    }

    @Test
    void testLeaveMatchAlwaysReturnsFalse() {
        Close close = new Close(mock(Team.class), mock(Team.class));
        assertFalse(close.leaveMatch(mock(User.class)));
    }

    @Test
    void testGetMinPlayersCountThrowsException() {
        Close close = new Close(mock(Team.class), mock(Team.class));
        assertThrows(UnsupportedOperationException.class, close::getMinPlayersCount);
    }

    @Test
    void testGetPlayerCountThrowsException() {
        Close close = new Close(mock(Team.class), mock(Team.class));
        assertThrows(UnsupportedOperationException.class, close::getPlayerCount);
    }

    @Test
    void testCheckStartThrowsException() {
        Close close = new Close(mock(Team.class), mock(Team.class));
        assertThrows(UnsupportedOperationException.class, close::checkStart);
    }
}
