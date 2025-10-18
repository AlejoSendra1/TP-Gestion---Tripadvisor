package ar.uba.fi.ingsoft1.todo_template.field;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum FieldFeatures {
    GRASS, 
    CEMENT,
    ARTIFICIAL_TURF,
    ROOF,
    LIGHTS,
    RESTROOMS,
    PARKING,
    WIFI,
    FOOD,
    DRINK,
    MUSIC;

    @JsonCreator
    public static FieldFeatures from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Característica inválida: no puede estar vacía");
        }
        try {
            return FieldFeatures.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Característica inválida: " + value);
        }
    }
} 
