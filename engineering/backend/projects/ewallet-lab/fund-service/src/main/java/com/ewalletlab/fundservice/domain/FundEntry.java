package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Transparent per-person history ("ai góp bao nhiêu, lúc nào"), including withdrawals. */
@Entity
@Table(name = "fund_entries")
public class FundEntry {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "fund_id", nullable = false)
    private UUID fundId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundEntryKind kind;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundEntryStatus status = FundEntryStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected FundEntry() {
        // JPA
    }

    public FundEntry(UUID fundId, UUID userId, String userName, FundEntryKind kind, BigDecimal amount) {
        this.fundId = fundId;
        this.userId = userId;
        this.userName = userName;
        this.kind = kind;
        this.amount = amount;
    }

    public void markCompleted() {
        status = FundEntryStatus.COMPLETED;
    }

    public void markFailed() {
        status = FundEntryStatus.FAILED;
    }

    public UUID getId() { return id; }
    public UUID getFundId() { return fundId; }
    public UUID getUserId() { return userId; }
    public String getUserName() { return userName; }
    public FundEntryKind getKind() { return kind; }
    public BigDecimal getAmount() { return amount; }
    public FundEntryStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
