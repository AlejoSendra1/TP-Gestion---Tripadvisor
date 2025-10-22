package ar.uba.fi.gestion.trippy.match.participationType;

import ar.uba.fi.gestion.trippy.user.User;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;

import java.io.Serializable;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = Open.class, name = "Open"),
        @JsonSubTypes.Type(value = Close.class, name = "Close")
})
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
public abstract class ParticipationType implements Serializable {
    @Id
    @GeneratedValue
    private Long partTypeId;

    public abstract boolean addPlayer(User user);

    public String toString() {
        return null;
    }

    public Long getId(){
        return partTypeId;
    }

    public Long setId(Long newId){
        return this.partTypeId = newId;
    }

    public abstract boolean leaveMatch(User user);

    public abstract Integer getMinPlayersCount();

    public abstract Integer getPlayerCount();

    public abstract void checkStart();
}


