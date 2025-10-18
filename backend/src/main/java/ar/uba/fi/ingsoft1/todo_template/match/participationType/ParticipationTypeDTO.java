package ar.uba.fi.ingsoft1.todo_template.match.participationType;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

//@Schema(description = "Tipo de participación en el partido (abierta o cerrada)")
@Schema(
        description = "Tipo de participación en el partido",
        discriminatorProperty = "type"
)

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = OpenDTO.class, name = "Open"),
        @JsonSubTypes.Type(value = CloseDTO.class, name = "Close")
})
public abstract class ParticipationTypeDTO implements Serializable {
}