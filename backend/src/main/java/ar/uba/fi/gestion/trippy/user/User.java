package ar.uba.fi.gestion.trippy.user;
import jakarta.persistence.*;


@Entity(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lastname;

    @Column(unique= true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "email-verified")
    private boolean emailVerified;

    @Column(name = "token-verified")
    private String tokenVerified;

    private String role;

    public User() {}

    public User(String name, String lastname, String email, String password) {
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.emailVerified = false;
    }

    public String password() {
        return this.password;
    }

    public String email() {return this.email;}

    public String getName() { return this.name;}

    public String getLastname() { return this.lastname;}

    public String getEmail() { return this.email;}

    public String getPassword() { return this.password;}

    public String getRole() { return this.role;}

    public boolean isEmailVerified() { return this.emailVerified;}

    public String getTokenVerified() { return this.tokenVerified;}

    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified;}

    public void setTokenVerified(String tokenVerified) { this.tokenVerified = tokenVerified;}
    public void setPassword(String newPassword) { this.password = newPassword;}

    public Long getId() { return this.id;}
}
