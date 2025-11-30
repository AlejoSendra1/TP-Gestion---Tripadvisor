package ar.uba.fi.gestion.trippy.shop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BenefitRepository extends JpaRepository<Benefit, Long> {
    List<Benefit> findByType(Benefit.BenefitType type);
}