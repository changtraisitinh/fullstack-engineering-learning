package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.*;
import com.ewalletlab.fundservice.repository.FundEntryRepository;
import com.ewalletlab.fundservice.repository.FundMemberRepository;
import com.ewalletlab.fundservice.repository.FundRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * {@code @Transactional} steps, split from {@link FundService} so each is its own transaction
 * across a proxy boundary (same as LuckyMoneyMutationExecutor / BnplMutationExecutor).
 *
 * <p>Ordering, per issue #14's Constraints (lessons of #3/#8/#10):
 * <ul>
 *   <li><b>Contribution</b>: record PENDING → debit the member's wallet → only then, under the fund
 *   row lock, add to the balance. The fund can never show money that wasn't actually debited.</li>
 *   <li><b>Withdrawal</b>: under the fund row lock, check + subtract the balance and record PENDING,
 *   commit → only then credit the creator's wallet; a failed credit adds the amount back. Concurrent
 *   withdrawals re-read the already-reduced balance, so the same đồng can't be paid out twice.</li>
 * </ul>
 */
@Component
class FundMutationExecutor {

    private final FundRepository funds;
    private final FundMemberRepository members;
    private final FundEntryRepository entries;

    FundMutationExecutor(FundRepository funds, FundMemberRepository members, FundEntryRepository entries) {
        this.funds = funds;
        this.members = members;
        this.entries = entries;
    }

    @Transactional
    Fund create(String name, String purpose, UUID creatorUserId, String creatorName, String creatorPhone) {
        Fund fund = funds.save(new Fund(name, purpose, creatorUserId, creatorName));
        members.save(new FundMember(fund.getId(), creatorUserId, creatorName, creatorPhone));
        return fund;
    }

    @Transactional
    FundMember addMember(UUID fundId, UUID requesterUserId, UUID userId, String name, String phone, long maxMembers) {
        Fund fund = lockOrThrow(fundId); // serializes invites too, so the member cap can't be raced past
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới có thể mời thành viên");
        }
        if (members.findByFundIdAndUserId(fundId, userId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Người này đã là thành viên của quỹ");
        }
        if (members.countByFundId(fundId) >= maxMembers) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Quỹ đã đủ " + maxMembers + " thành viên");
        }
        try {
            return members.saveAndFlush(new FundMember(fundId, userId, name, phone));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Người này đã là thành viên của quỹ");
        }
    }

    @Transactional
    FundEntry startContribution(UUID fundId, UUID userId, BigDecimal amount) {
        FundMember member = memberOrForbidden(fundId, userId, "Chỉ thành viên của quỹ mới có thể góp tiền");
        return entries.save(new FundEntry(fundId, userId, member.getName(), FundEntryKind.CONTRIBUTION, amount));
    }

    @Transactional
    void completeContribution(UUID fundId, UUID entryId) {
        Fund fund = lockOrThrow(fundId);
        FundEntry entry = entries.findById(entryId).orElseThrow();
        fund.add(entry.getAmount());
        entry.markCompleted();
    }

    @Transactional
    void failEntry(UUID entryId) {
        entries.findById(entryId).ifPresent(FundEntry::markFailed);
    }

    @Transactional
    FundEntry claimWithdrawal(UUID fundId, UUID userId, BigDecimal amount) {
        Fund fund = lockOrThrow(fundId);
        if (!fund.getCreatorUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới có thể rút tiền (giới hạn của bản MVP)");
        }
        if (amount.compareTo(fund.getBalance()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư quỹ không đủ");
        }
        fund.subtract(amount);
        return entries.save(new FundEntry(fundId, userId, fund.getCreatorName(), FundEntryKind.WITHDRAWAL, amount));
    }

    @Transactional
    void revertWithdrawal(UUID fundId, UUID entryId) {
        Fund fund = lockOrThrow(fundId);
        FundEntry entry = entries.findById(entryId).orElseThrow();
        if (entry.getStatus() != FundEntryStatus.PENDING) {
            return;
        }
        fund.add(entry.getAmount());
        entry.markFailed();
    }

    @Transactional
    void completeWithdrawal(UUID entryId) {
        entries.findById(entryId).ifPresent(FundEntry::markCompleted);
    }

    private FundMember memberOrForbidden(UUID fundId, UUID userId, String message) {
        if (!funds.existsById(fundId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ này");
        }
        return members.findByFundIdAndUserId(fundId, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, message));
    }

    private Fund lockOrThrow(UUID fundId) {
        return funds.lockById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ này"));
    }
}
