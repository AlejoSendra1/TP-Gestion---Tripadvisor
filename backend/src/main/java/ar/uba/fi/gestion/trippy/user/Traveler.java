package ar.uba.fi.gestion.trippy.user;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "travelers")
@DiscriminatorValue("TRAVELER")
public class Traveler extends User {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private Integer xp = 0;

    @Column(nullable = false)
    private Integer level = 1;

    @Column
    private String achievements;

    @Column
    private String preferences;

    public Traveler(){}

    public Traveler(String email,String password,String firstName,String lastName){
        super(email,password);
        this.setRole("USER");
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getFirstName() { return this.firstName;}

    public String getLastName() { return this.lastName;}

    public Integer getXp() { return this.xp;   }

    public Integer getLevel() { return this.level;}

    public String getUserType(){ return "TRAVELER"; }

    public Integer getUserXP() { return this.xp; }

    public Integer getUserLevel() { return this.level; }
}
