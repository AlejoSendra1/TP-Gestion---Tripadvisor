package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.user.UserZones;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface FieldRepository extends JpaRepository<Field, Long> {

    List<Field> findByOwnerEmail(String ownerEmail);
    List<Field> findByOwnerId(Long ownerId);
    List<Field> findByName(String name);
    List<Field> findByZone(UserZones zone);
    List<Field> findByFeaturesContaining(FieldFeatures feature);
}
