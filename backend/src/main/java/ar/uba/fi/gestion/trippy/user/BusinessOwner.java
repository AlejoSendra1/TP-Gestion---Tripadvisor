package ar.uba.fi.gestion.trippy.user;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "business_owners")
@DiscriminatorValue("OWNER")
public class BusinessOwner extends User {

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false)
    private String businessType;

    @Column
    private String businessDescription;

    @Column
    private Boolean verified = false;

    public BusinessOwner(){}

    public BusinessOwner(String email,String password,String businessName,String businessType){
        super(email,password);
        this.businessName = businessName;
        this.businessType = businessType;
    }

    public String getBusinessName() { return this.businessName; }

    public String getBusinessType() { return this.businessType; }

    public Boolean getVerified() { return this.verified;  }

    public String getUserType(){ return "OWNER"; }

    public Boolean isVerified() { return this.verified; }
}

// como hacer el constructor

