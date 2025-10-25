package ar.uba.fi.gestion.trippy.user;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Boolean agreeToTerms = false;

    @Column(name = "token-verified")
    private String tokenVerified;

    public User(String email, String password){
        this.email = email;
        this.password = password;
        this.agreeToTerms = true;
    }

    public Long getId() { return this.id;}

    public String getEmail() { return this.email;}
    public String getPassword() { return this.password;}
    public abstract String getUserType();
    public String getRole(){return "USER"; }

    public void setTokenVerified(String tokenVerified) { this.tokenVerified = tokenVerified;}


}

