package ar.uba.fi.ingsoft1.todo_template.field;

import java.util.List;

import ar.uba.fi.ingsoft1.todo_template.FieldSchedule.FieldScheduleCreateDTO;
import ar.uba.fi.ingsoft1.todo_template.user.UserZones;
import io.swagger.v3.oas.annotations.media.Schema;

public record FieldUpdateDTO(
    @Schema(description = "Actualizacion del nombre", example = "Canchita")
    String name,

    @Schema(description = "Actualizacion de la descripcion")
    String description,

    @Schema(description = "Actualizacion de la direccion")
    String location,
    @Schema(description = "Actualizacion de la zona")
    UserZones zone,
    @Schema(description = "Actualizacion del precio")
    Integer price,
    @Schema(description = "Nuevas caracteristicas")
    List<String> features,

    @Schema(description = "Nuevas imagenes")
    List<String> images,
    @Schema(description = "Horarios actualizados")
    FieldScheduleCreateDTO schedule
) {
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public UserZones getZone() {
        return zone;
    }

    public Integer getPrice() {
        return price;
    }

    public List<String> getFeatures() {
        return features;
    }

    public List<String> getImages() {
        return images;
    }
}
