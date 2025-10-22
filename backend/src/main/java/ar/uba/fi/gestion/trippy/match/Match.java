package ar.uba.fi.gestion.trippy.match;

import ar.uba.fi.gestion.trippy.match.participationType.ParticipationType;
import ar.uba.fi.gestion.trippy.reservation.Reservation;
import ar.uba.fi.gestion.trippy.user.User;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Long matchId;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER )
    @JoinColumn(name = "participationTypeId", nullable = false)
    private ParticipationType participationType;

    @Column
    private String state = "Active";

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservationId", nullable = false)
    private Reservation reservation;

    public Match(ParticipationType pt, Reservation reserve) {
        this.participationType = pt;
        this.reservation = reserve;
    }

    public Match(){}

    public boolean isOrganizer(User actualUser){
        return actualUser.equals(this.reservation.getOrganizer());
    }

    protected void setId(Long id){this.matchId = id;}

    public Long getId() {
        return matchId;
    }

    public String getState() { return state; }

    public ParticipationType getParticipationType() {
        return participationType;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void start(){
        if (!Objects.equals(this.state, "Closed")){
            throw new IllegalStateException("Cannot start match yet");
        }
        this.state = "Started";
    }

    public void close() {
        if (!Objects.equals(this.state, "Active")){
            throw new IllegalStateException("Cannot close match");
        }
        checkStart();
        this.state = "Closed";}

    public boolean leaveMatch(User user) {
        if (!Objects.equals(this.state, "Active")){
            throw new IllegalStateException("Cannot leave match");
        }
        return this.participationType.leaveMatch(user);
    }

    public boolean join(User user) {
        if (!Objects.equals(this.state, "Active")){
            throw new IllegalStateException("Cannot join match");
        }
        return participationType.addPlayer(user);
    }
    
    private void checkStart(){
        participationType.checkStart();
    }

    public void setParticipationType(ParticipationType partType) {
        this.participationType = partType;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }
}
