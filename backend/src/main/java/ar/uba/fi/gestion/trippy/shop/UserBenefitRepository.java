package ar.uba.fi.gestion.trippy.shop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserBenefitRepository extends JpaRepository<UserBenefit, Long> {
    List<UserBenefit> findByUserId(Long userId);
    List<UserBenefit> findByUserIdAndUsed(Long userId, Boolean used);
}