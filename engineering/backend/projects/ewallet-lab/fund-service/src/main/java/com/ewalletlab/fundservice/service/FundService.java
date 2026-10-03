package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.*;
import com.ewalletlab.fundservice.repository.FundEntryRepository;
import com.ewalletlab.fundservice.repository.FundMemberRepository;
import com.ewalletlab.fundservice.repository.FundRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

/** Issue #14 — "Quỹ nhóm" MVP (no interest/"Sinh lời" — explicitly out of scope). */
@Service
public class FundService {

    private final FundRepository funds;
    private final FundMemberRepository members;
    private final FundEntryRepository entries;
    private final FundMutationExecutor executor;
    private final UserServiceClient users;
    private final WalletServiceClient wallet;
    private final long maxMembers;

    public FundService(FundRepository funds, FundMemberRepository members, FundEntryRepository entries,
                       FundMutationExecutor executor, UserServiceClient users, WalletServiceClient wallet,
                       @Value("${ewallet-lab.fund.max-members}") long maxMembers) {
        this.funds = funds;
        this.members = members;
        this.entries = entries;
        this.executor = executor;
        this.users = users;
        this.wallet = wallet;
        this.maxMembers = maxMembers;
    }

    public record Detail(Fund fund, List<FundMember> members, List<FundEntry> history) {
    }

    public Detail create(String name, String purpose, UUID creatorUserId, String creatorName, String creatorPhone) {
        return detailFor(executor.create(name.strip(), purpose == null ? null : purpose.strip(), creatorUserId, creatorName, creatorPhone).getId(), creatorUserId);
    }

    public List<Fund> listForMember(UUID userId) {
        List<UUID> ids = members.findByUserId(userId).stream().map(FundMember::getFundId).toList();
        return ids.isEmpty() ? List.of() : funds.findByIdInOrderByCreatedAtDesc(ids);
    }

    /** Only members can see a fund and its history. */
    public Detail detailFor(UUID fundId, UUID viewerUserId) {
        Fund fund = funds.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ này"));
        List<FundMember> list = members.findByFundIdOrderByJoinedAtAsc(fundId);
        if (list.stream().noneMatch(m -> m.getUserId().equals(viewerUserId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của quỹ này");
        }
        return new Detail(fund, list, entries.findByFundIdOrderByCreatedAtDesc(fundId));
    }

    public Detail invite(UUID fundId, UUID requesterUserId, String phone) {
        UserServiceClient.UserResponse user;
        try {
            user = users.findByPhone(phone.strip());
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy người dùng Ewallet Lab với số điện thoại này (lab không hỗ trợ mời SMS)");
        }
        executor.addMember(fundId, requesterUserId, user.id(), user.name(), user.phone(), maxMembers);
        return detailFor(fundId, requesterUserId);
    }

    public Detail contribute(UUID fundId, UUID userId, BigDecimal amount) {
        FundEntry entry = executor.startContribution(fundId, userId, amount);
        Fund fund = funds.findById(fundId).orElseThrow();
        try {
            wallet.debitContribution(userId, amount, entry.getId(), fund.getName());
        } catch (HttpClientErrorException.Conflict e) {
            executor.failEntry(entry.getId());
            String reason = e.getResponseBodyAsString(StandardCharsets.UTF_8);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Không trừ được tiền ví: " + (reason.isBlank() ? "số dư không đủ" : reason));
        } catch (RuntimeException e) {
            executor.failEntry(entry.getId());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không gọi được wallet-service, khoản góp đã huỷ", e);
        }
        executor.completeContribution(fundId, entry.getId());
        return detailFor(fundId, userId);
    }

    public Detail withdraw(UUID fundId, UUID userId, BigDecimal amount) {
        FundEntry claimed = executor.claimWithdrawal(fundId, userId, amount);
        Fund fund = funds.findById(fundId).orElseThrow();
        try {
            wallet.creditWithdrawal(userId, amount, claimed.getId(), fund.getName());
        } catch (RuntimeException e) {
            executor.revertWithdrawal(fundId, claimed.getId());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Không cộng được tiền vào ví, số dư quỹ đã được hoàn lại", e);
        }
        executor.completeWithdrawal(claimed.getId());
        return detailFor(fundId, userId);
    }
}
