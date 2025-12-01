package ar.uba.fi.gestion.trippy.user.travelerBenefits;

public record ShopItemDto (
        String title,
        Integer price,
        String iconName,
        String description,
        boolean isActive
) {

  public Integer getPrice() { return this.price; }
}

