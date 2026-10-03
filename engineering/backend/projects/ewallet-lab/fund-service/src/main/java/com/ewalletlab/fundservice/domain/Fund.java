package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #14 — "Quỹ nhóm": a shared pot that N members pay INTO (unlike lucky money's 1 → 1
 * escrow), with no expiry. MVP: only the creator may withdraw (deliberate simplification — no
 * voting / multi-signature).
 *
 * <p>{@link #balance} only ever changes inside a transaction holding this row's lock
 * ({@code FundRepository.lockById}).
 */
@Entity
@Table(name = "funds")
public class Fund {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String purpose;

    @Column(name = "creator_user_id", nullable = false)
    private UUID creatorUserId;

    @Column(name = "creator_name", nullable = false)
    private String creatorName;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Version
    private Long version;

    protected Fund() {
        // JPA
    }

    public Fund(String name, String purpose, UUID creatorUserId, String creatorName) {
        this.name = name;
        this.purpose = purpose;
        this.creatorUserId = creatorUserId;
        this.creatorName = creatorName;
    }

    public void add(BigDecimal amount) {
        balance = balance.add(amount);
    }

    public void subtract(BigDecimal amount) {
        balance = balance.subtract(amount);
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getPurpose() { return purpose; }
    public UUID getCreatorUserId() { return creatorUserId; }
    public String getCreatorName() { return creatorName; }
    public BigDecimal getBalance() { return balance; }
    public Instant getCreatedAt() { return createdAt; }
}
