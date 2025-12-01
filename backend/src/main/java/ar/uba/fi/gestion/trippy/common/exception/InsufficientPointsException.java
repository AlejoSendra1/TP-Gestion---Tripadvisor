package ar.uba.fi.gestion.trippy.common.exception;

public class InsufficientPointsException extends RuntimeException {
    public InsufficientPointsException() {
        super(String.format("Not enough points"));
        ;
    }
}
