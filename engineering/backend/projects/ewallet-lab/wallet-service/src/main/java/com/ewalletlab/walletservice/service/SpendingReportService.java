package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Issue #16 — "Báo cáo chi tiêu tự động": read-only aggregation over the existing ledger. No new
 * table, no category, no cross-service call.
 *
 * <p>"Chi tiêu" is exactly {@link #SPEND_TYPES} — the same definition mfe-wallet's Home.tsx already
 * used client-side ({@code SPEND_TYPES}). Not counted: TOPUP/TRANSFER_IN/REFUND (money coming in)
 * and BNPL_REPAYMENT (issue #18 — paying back a "Ví Trả Sau" balance is settling earlier purchases,
 * not new spending, and those purchases never touched this ledger; counting the repayment would
 * also be outside the ticket's fixed definition).
 *
 * <p>Aggregated in SQL ({@code GROUP BY type}), not by loading the whole history into Java.
 */
@Service
public class SpendingReportService {

    public static final List<TransactionType> SPEND_TYPES =
        List.of(TransactionType.TRANSFER_OUT, TransactionType.BILL_PAYMENT, TransactionType.WITHDRAW);

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final Clock clock;

    @Autowired
    public SpendingReportService(WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this(walletRepository, transactionRepository, Clock.systemDefaultZone());
    }

    SpendingReportService(WalletRepository walletRepository, TransactionRepository transactionRepository, Clock clock) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.clock = clock;
    }

    public record TypeTotal(TransactionType type, BigDecimal amount, long count) {
    }

    public record Report(
        SpendingPeriod period, Instant from, Instant to, BigDecimal total, long count, List<TypeTotal> breakdown,
        Instant previousFrom, Instant previousTo, BigDecimal previousTotal) {
    }

    public Report report(UUID userId, SpendingPeriod period) {
        LocalDate today = LocalDate.now(clock);
        SpendingPeriod.Window current = period.current(today, clock.instant(), clock.getZone());
        SpendingPeriod.Window previous = period.previous(today, clock.getZone());

        // A read must not create a wallet as a side effect — no wallet simply means no spending.
        Map<TransactionType, TypeTotal> byType = new EnumMap<>(TransactionType.class);
        SPEND_TYPES.forEach(t -> byType.put(t, new TypeTotal(t, BigDecimal.ZERO, 0)));
        BigDecimal previousTotal = BigDecimal.ZERO;

        var wallet = walletRepository.findByUserId(userId);
        if (wallet.isPresent()) {
            UUID walletId = wallet.get().getId();
            for (TransactionRepository.TypeTotalRow row :
                    transactionRepository.sumByType(walletId, SPEND_TYPES, current.from(), current.to())) {
                byType.put(row.getType(), new TypeTotal(row.getType(), row.getTotal(), row.getTxCount()));
            }
            previousTotal = transactionRepository.sumAmountByWalletIdAndTypeInBetween(
                walletId, SPEND_TYPES, previous.from(), previous.to());
        }

        List<TypeTotal> breakdown = SPEND_TYPES.stream().map(byType::get).toList();
        BigDecimal total = breakdown.stream().map(TypeTotal::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        long count = breakdown.stream().mapToLong(TypeTotal::count).sum();
        return new Report(period, current.from(), current.to(), total, count, breakdown,
            previous.from(), previous.to(), previousTotal);
    }
}
