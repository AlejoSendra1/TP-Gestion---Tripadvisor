package ar.uba.fi.ingsoft1.todo_template.user;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;


@Entity(name = "users")
public class User implements UserCredentials {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lastname;

    @Column(unique= true, nullable = false)
    private String email;

    @NotEmpty(message = "El usuario debe tener asociado al menos una zona")
    @ElementCollection
    @CollectionTable(name = "user_zones", joinColumns = @JoinColumn(name = "id"))
    @Column(name = "zone")
    @Enumerated(EnumType.STRING)
    private List<UserZones> zones;

    @Column(nullable = false)
    private String password;

    private String photo;

    @Column (nullable = false)
    private String gender;

    @Column (nullable = false)
    private Short age;

    @Column(name = "email-verified")
    private boolean emailVerified;

    @Column(name = "token-verified")
    private String tokenVerified;

    private String role = "USER";

    public User() {}

    public User(String name, String lastname, String email, List<UserZones> zones, String password, String gender, String photo, Short age) {
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.zones = zones;
        this.password = password;
        this.gender = gender;
        this.photo = photo;
        this.age = age;
        this.emailVerified = false;
    }

    @Override
    public String password() {
        return this.password;
    }

    @Override
    public String email() {return this.email;}

    public String getName() { return this.name;}

    public String getLastname() { return this.lastname;}

    public String getEmail() { return this.email;}

    public List<UserZones> getZones() { return this.zones;}

    public String getPassword() { return this.password;}

    public String getGender() { return this.gender;}

    public String getPhoto() { return this.photo;}

    public String getRole() { return this.role;}

    public Short getAge() { return this.age;}

    public boolean isEmailVerified() { return this.emailVerified;}

    public String getTokenVerified() { return this.tokenVerified;}

    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified;}

    public void setTokenVerified(String tokenVerified) { this.tokenVerified = tokenVerified;}
    public void setPassword(String newPassword) { this.password = newPassword;}

    public Long getId() { return this.id;}
}
