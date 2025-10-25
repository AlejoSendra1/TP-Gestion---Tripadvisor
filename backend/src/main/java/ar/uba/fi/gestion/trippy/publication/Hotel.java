package ar.uba.fi.gestion.trippy.publication;


import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.HashMap;
import java.util.Map;


@Entity
@DiscriminatorValue("HOTEL")
public class Hotel extends Publication {

    private int roomCount;
    private int capacity;

    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();
        details.put("roomCount", this.roomCount);
        details.put("capacity", this.capacity);
        return details;
    }

    public void setRoomCount(int roomCount) {
        this.roomCount = roomCount;
    }

    public void setCapacity(int capacity) { this.capacity = capacity; }

}