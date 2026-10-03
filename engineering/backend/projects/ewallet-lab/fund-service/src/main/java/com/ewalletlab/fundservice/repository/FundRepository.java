package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.Fund;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FundRepository extends JpaRepository<Fund, UUID> {

    /** SELECT ... FOR UPDATE — every balance change of one fund runs one at a time. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from Fund f where f.id = :id")
    Optional<Fund> lockById(@Param("id") UUID id);

    List<Fund> findByIdInOrderByCreatedAtDesc(Collection<UUID> ids);
}
