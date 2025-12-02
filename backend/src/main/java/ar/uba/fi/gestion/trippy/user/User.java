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

    private String role;

    @Column(name = "photo_url")
    private String photo;

    public User(){}

    public User(String email, String password){
        this.email = email;
        this.password = password;
        this.agreeToTerms = true;
    }

    public Long getId() { return this.id;}

    public String getEmail() { return this.email;}
    public String getPassword() { return this.password;}
    public abstract String getUserType();

    public String getRole(){return this.role; }
    public void setRole(String role) { this.role = role;}
    public void setTokenVerified(String tokenVerified) { this.tokenVerified = tokenVerified;}
    public String getPhoto() { return this.photo;}
    public void setPhoto(String photo) { this.photo = photo; }
}

