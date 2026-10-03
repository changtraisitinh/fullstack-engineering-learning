package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** Issue #16 — runs the real JPQL (GROUP BY) against H2. */
@DataJpaTest
class SpendingReportServiceTest {

    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    // Thursday 15 Oct 2026, 10:00 — week started Mon 12 Oct, month started 1 Oct.
    private static final Clock CLOCK = Clock.fixed(LocalDateTime.of(2026, 10, 15, 10, 0).atZone(ZONE).toInstant(), ZONE);

    @Autowired
    WalletRepository wallets;

    @Autowired
    TransactionRepository transactions;

    private SpendingReportService service() {
        return new SpendingReportService(wallets, transactions, CLOCK);
    }

    private void tx(Wallet w, TransactionType type, String amount, LocalDateTime at) {
        Transaction t = new Transaction(w.getId(), type, new BigDecimal(amount), null, null);
        ReflectionTestUtils.setField(t, "createdAt", at.atZone(ZONE).toInstant());
        transactions.save(t);
    }

    @Test
    void monthAndWeekTotalsCountOnlySpendTypesInsideTheWindow() {
        Wallet w = wallets.save(new Wallet(UUID.randomUUID()));
        tx(w, TransactionType.TRANSFER_OUT, "100000", LocalDateTime.of(2026, 10, 14, 9, 0));   // this week
        tx(w, TransactionType.BILL_PAYMENT, "50000", LocalDateTime.of(2026, 10, 12, 0, 0));    // Monday 00:00 → this week
        tx(w, TransactionType.WITHDRAW, "200000", LocalDateTime.of(2026, 10, 5, 12, 0));       // this month, last week
        tx(w, TransactionType.TRANSFER_OUT, "30000", LocalDateTime.of(2026, 10, 1, 0, 0));     // day 1 00:00 → this month
        tx(w, TransactionType.TRANSFER_OUT, "999", LocalDateTime.of(2026, 9, 30, 23, 59));     // last month
        // Never spending, even inside the window:
        tx(w, TransactionType.TOPUP, "5000000", LocalDateTime.of(2026, 10, 14, 9, 0));
        tx(w, TransactionType.TRANSFER_IN, "70000", LocalDateTime.of(2026, 10, 14, 9, 0));
        tx(w, TransactionType.REFUND, "10000", LocalDateTime.of(2026, 10, 14, 9, 0));
        tx(w, TransactionType.BNPL_REPAYMENT, "33000", LocalDateTime.of(2026, 10, 14, 9, 0));

        var month = service().report(w.getUserId(), SpendingPeriod.MONTH);
        assertThat(month.total()).isEqualByComparingTo("380000");
        assertThat(month.count()).isEqualTo(4);
        assertThat(month.breakdown()).extracting(SpendingReportService.TypeTotal::type)
            .containsExactly(TransactionType.TRANSFER_OUT, TransactionType.BILL_PAYMENT, TransactionType.WITHDRAW);
        assertThat(month.breakdown().get(0).amount()).isEqualByComparingTo("130000");
        assertThat(month.breakdown().get(0).count()).isEqualTo(2);
        assertThat(month.breakdown().get(2).amount()).isEqualByComparingTo("200000");
        assertThat(month.previousTotal()).isEqualByComparingTo("999");
        assertThat(month.from()).isEqualTo(LocalDate.of(2026, 10, 1).atStartOfDay(ZONE).toInstant());

        var week = service().report(w.getUserId(), SpendingPeriod.WEEK);
        assertThat(week.total()).isEqualByComparingTo("150000");
        assertThat(week.breakdown().get(2).amount()).isEqualByComparingTo("0");
        assertThat(week.previousTotal()).isEqualByComparingTo("200000"); // Mon 5 – Sun 11 Oct: only the withdraw (1 Oct is the week before)
    }

    @Test
    void unknownUserGetsZerosAndNoWalletIsCreated() {
        UUID user = UUID.randomUUID();
        var r = service().report(user, SpendingPeriod.MONTH);
        assertThat(r.total()).isEqualByComparingTo("0");
        assertThat(r.breakdown()).hasSize(3).allSatisfy(t -> assertThat(t.amount()).isEqualByComparingTo("0"));
        assertThat(wallets.findByUserId(user)).isEmpty();
    }

    @Test
    void parseAcceptsWeekMonthOnly() {
        assertThat(SpendingPeriod.parse("week")).isEqualTo(SpendingPeriod.WEEK);
        assertThat(SpendingPeriod.parse(" MONTH ")).isEqualTo(SpendingPeriod.MONTH);
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> SpendingPeriod.parse("year"))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
