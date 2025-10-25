package ar.uba.fi.gestion.trippy.user;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.function.Function;

public record RegistrationRequestDTO (

    @NotBlank(message = "Type of user is required")
    String userType,

    String firstName,
    String lastName,

    @NotBlank(message = "Email is required")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    @NotBlank(message = "Password confirmation is required")
    String confirmPassword,

    @NotNull(message = "Must agree to terms")
    Boolean agreeToTerms,

    // Business-specific fields (optional)
    String businessName,
    String businessType
    ){
    // TODO despues implementar polimorfismo y verificacion de campos
    public User asUser(Function<String, String> encryptPassword){
        if (userType.equals("traveler")) {
            return new Traveler(this.email,this.password,this.firstName,this.lastName);
        }
        return new BusinessOwner(this.email,this.password,this.businessName, this.businessType);
    }
}

