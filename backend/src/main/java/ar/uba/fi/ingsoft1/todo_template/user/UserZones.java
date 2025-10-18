package ar.uba.fi.ingsoft1.todo_template.user;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum UserZones {
    // Zona norte
    VICENTE_LOPEZ,
    SAN_ISIDRO,
    SAN_FERNANDO,
    TIGRE,
    ESCOBAR,
    PILAR,
    JOSE_C_PAZ,
    MALVINAS_ARGENTINAS,
    SAN_MIGUEL,
    SAN_MARTIN,

    // Zona oeste
    LA_MATANZA,
    TRES_DE_FEBRERO,
    HURLINGHAM,
    MORON,
    ITUZAINGO,
    MERLO,
    MORENO,
    GENERAL_RODRIGUEZ,
    MARCOS_PAZ,


    // Zona sur
    AVELLANEDA,
    LANUS,
    LOMAS_DE_ZAMORA,
    ESTEBAN_DE_ECHEVERRIA,
    EZEIZA,
    SAN_VICENTE,
    PRESIDENTE_PERON,
    ALMIRANTE_BROWN,
    QUILMES,
    BERAZATEGUI,
    FLORENCIO_VARELA,

    // CABA
    AGRONOMIA,
    ALMAGRO,
    BALVANERA,
    BARRACAS,
    BELGRANO,
    BOEDO,
    CABALLITO,
    CHACARITA,
    COGHLAN,
    COLEGIALES,
    CONSTITUCION,
    FLORES,
    FLORESTA,
    LA_BOCA,
    LA_PATERNAL,
    LINIERS,
    MATADEROS,
    MONTE_CASTRO,
    MONSERRAT,
    NUEVA_POMPEYA,
    NUNEZ,
    PALERMO,
    PARQUE_AVELLANEDA,
    PARQUE_CHACABUCO,
    PARQUE_CHAS,
    PARQUE_PATRICIOS,
    PUERTO_MADERO,
    RECOLETA,
    RETIRO,
    SAAVEDRA,
    SAN_CRISTOBAL,
    SAN_NICOLAS,
    SAN_TELMO,
    VELEZ_SARSFIELD,
    VERSALLES,
    VILLA_CRESPO,
    VILLA_DEL_PARQUE,
    VILLA_DEVOTO,
    VILLA_GENERAL_MITRE;

    @JsonCreator
    public static UserZones from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Zona inválida: no puede estar vacía");
        }
        try {
            return UserZones.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Zona inválida: " + value);
        }
    }
}
