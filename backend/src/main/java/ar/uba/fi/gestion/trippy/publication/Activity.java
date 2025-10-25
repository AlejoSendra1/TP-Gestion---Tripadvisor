package ar.uba.fi.gestion.trippy.publication;


import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.HashMap;
import java.util.Map;


@Entity
@DiscriminatorValue("ACTIVITY")
public class Activity extends Publication {

    private int durationInHours; // "duración"
    private String meetingPoint;   // "punto de encuentro"
    private String whatIsIncluded;
    private String activityLevel;  // "nivel de actividad física"
    private String language;

    @Override
    public Map<String, Object> fetchSpecificDetails() {
        Map<String, Object> details = new HashMap<>();

        details.put("durationInHours", this.durationInHours);
        details.put("meetingPoint", this.meetingPoint);
        details.put("whatIsIncluded", this.whatIsIncluded);
        details.put("activityLevel", this.activityLevel);
        details.put("language", this.language);

        return details;
    }

    public void setDurationInHours(int durationInHours) {
        this.durationInHours = durationInHours;
    }
    public void setMeetingPoint(String meetingPoint) {
        this.meetingPoint = meetingPoint;
    }
    public void setWhatIsIncluded(String whatIsIncluded) {
        this.whatIsIncluded = whatIsIncluded;
    }
    public void setActivityLevel(String activityLevel) {
        this.activityLevel = activityLevel;
    }
    public void setLanguage(String language) {
        this.language = language;
    }

}