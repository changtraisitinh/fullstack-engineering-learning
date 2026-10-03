package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.FundMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FundMemberRepository extends JpaRepository<FundMember, UUID> {
    List<FundMember> findByFundIdOrderByJoinedAtAsc(UUID fundId);

    List<FundMember> findByUserId(UUID userId);

    Optional<FundMember> findByFundIdAndUserId(UUID fundId, UUID userId);

    long countByFundId(UUID fundId);
}
