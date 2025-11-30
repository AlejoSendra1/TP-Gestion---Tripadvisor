package ar.uba.fi.gestion.trippy.shop;

import ar.uba.fi.gestion.trippy.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBenefitRepository extends JpaRepository<UserBenefit, Long> {
    
    List<UserBenefit> findByUserId(Long userId);
    
    List<UserBenefit> findByUserIdAndUsedFalse(Long userId);
    
    @Query("SELECT ub FROM UserBenefit ub WHERE ub.user.id = :userId AND ub.benefit.type = :benefitType AND ub.used = false")
    List<UserBenefit> findActiveByUserIdAndType(
        @Param("userId") Long userId, 
        @Param("benefitType") Benefit.BenefitType benefitType
    );
    
    boolean existsByUserIdAndBenefitIdAndUsedFalse(Long userId, Long benefitId);
}