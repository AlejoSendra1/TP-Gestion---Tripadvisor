package ar.uba.fi.gestion.trippy.common.exception;

public class DuplicateEntityException extends RuntimeException {
    public DuplicateEntityException(String entity, String unique) {
        super(String.format("%s with this %s already exists", entity, unique));;
    }
}
