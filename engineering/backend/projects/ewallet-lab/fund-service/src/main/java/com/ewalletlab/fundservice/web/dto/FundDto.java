package com.ewalletlab.fundservice.web.dto;

import com.ewalletlab.fundservice.domain.*;
import com.ewalletlab.fundservice.service.FundService;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FundDto(
    UUID id, String name, String purpose, UUID creatorUserId, String creatorName, BigDecimal balance,
    Instant createdAt, List<MemberDto> members, List<EntryDto> history
) {
    /** {@code contributed} = sum of this member's COMPLETED contributions (transparent per-person total). */
    public record MemberDto(UUID userId, String name, String phone, boolean creator, BigDecimal contributed, Instant joinedAt) {
    }

    public record EntryDto(UUID id, UUID userId, String userName, FundEntryKind kind, BigDecimal amount,
                           FundEntryStatus status, Instant createdAt) {
        static EntryDto from(FundEntry e) {
            return new EntryDto(e.getId(), e.getUserId(), e.getUserName(), e.getKind(), e.getAmount(), e.getStatus(), e.getCreatedAt());
        }
    }

    public record SummaryDto(UUID id, String name, String purpose, UUID creatorUserId, String creatorName,
                             BigDecimal balance, Instant createdAt) {
        public static SummaryDto from(Fund f) {
            return new SummaryDto(f.getId(), f.getName(), f.getPurpose(), f.getCreatorUserId(), f.getCreatorName(), f.getBalance(), f.getCreatedAt());
        }
    }

    public static FundDto from(FundService.Detail d) {
        Fund f = d.fund();
        List<MemberDto> members = d.members().stream().map(m -> new MemberDto(
            m.getUserId(), m.getName(), m.getPhone(), m.getUserId().equals(f.getCreatorUserId()),
            d.history().stream()
                .filter(e -> e.getUserId().equals(m.getUserId()) && e.getKind() == FundEntryKind.CONTRIBUTION
                    && e.getStatus() == FundEntryStatus.COMPLETED)
                .map(FundEntry::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
            m.getJoinedAt())).toList();
        return new FundDto(f.getId(), f.getName(), f.getPurpose(), f.getCreatorUserId(), f.getCreatorName(), f.getBalance(),
            f.getCreatedAt(), members, d.history().stream().map(EntryDto::from).toList());
    }
}
