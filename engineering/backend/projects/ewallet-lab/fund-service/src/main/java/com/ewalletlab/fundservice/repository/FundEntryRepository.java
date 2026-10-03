package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.FundEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FundEntryRepository extends JpaRepository<FundEntry, UUID> {
    List<FundEntry> findByFundIdOrderByCreatedAtDesc(UUID fundId);
}
