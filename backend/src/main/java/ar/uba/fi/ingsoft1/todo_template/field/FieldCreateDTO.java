package ar.uba.fi.ingsoft1.todo_template.field;

import java.util.List;

import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserZones;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record FieldCreateDTO(
        @Schema(description = "Nombre", example = "Los Botines")
        @NotNull @NotEmpty String name,

        @Schema(description = "Direccion", example="Los Polvorines 1200")
        @NotNull @NotEmpty String location,
        @Schema(description = "Zona", example = "FLORENCIO_VARELA")
        @NotNull @Valid UserZones zone,

        @Schema(description = "Caracteristicas",example = "[\"GRASS\", \"ARTIFICIAL_TURF\", \"ROOF\"]" )
        @NotNull @NotEmpty List<FieldFeatures> features,
        @Schema(description = "Fotos del lugar", example = "[\"https://example.com/1.jpg\", \"https://example.com/2.jpg\"]")
        List<String> images
) {
    public Field asField(User owner) {
        return new Field(owner, name, location, zone, features, images);
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public UserZones getZone() {
        return zone;
    }

    public List<FieldFeatures> getFeatures() {
        return features;
    }

    public List<String> getImages() {
        return images;
    }
}