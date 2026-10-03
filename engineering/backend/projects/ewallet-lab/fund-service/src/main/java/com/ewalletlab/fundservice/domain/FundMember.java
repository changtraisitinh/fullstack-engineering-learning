package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fund_members", uniqueConstraints = @UniqueConstraint(columnNames = {"fund_id", "user_id"}))
public class FundMember {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "fund_id", nullable = false)
    private UUID fundId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    private String phone;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();

    protected FundMember() {
        // JPA
    }

    public FundMember(UUID fundId, UUID userId, String name, String phone) {
        this.fundId = fundId;
        this.userId = userId;
        this.name = name;
        this.phone = phone;
    }

    public UUID getId() { return id; }
    public UUID getFundId() { return fundId; }
    public UUID getUserId() { return userId; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public Instant getJoinedAt() { return joinedAt; }
}
