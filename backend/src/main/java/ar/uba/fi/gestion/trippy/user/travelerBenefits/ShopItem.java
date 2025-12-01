package ar.uba.fi.gestion.trippy.user.travelerBenefits;

import jakarta.persistence.*;

@Entity
@Table(name = "shop_items")
public class ShopItem {

    @Id
    private String title;

    @Column(length = 30)
    private String icon; // Emoji

    @Column(length = 500)
    private String description;

    @Column(nullable = false, name = "points_requiered")
    private Integer pointsRequired;

    /*
     * @ManyToOne
     * 
     * @JoinColumn(name = "category_id")
     * private ItemCategory category; por ahi estaria bueno para que tengan distinto
     * color :)
     */

    public String getTitle() {
        return this.title;
    }

    public String getIcon() { return this.icon; }

    public String getDescription() {
        return this.description;
    }

    public Integer getPointsRequired() {
        return this.pointsRequired;
    }

}