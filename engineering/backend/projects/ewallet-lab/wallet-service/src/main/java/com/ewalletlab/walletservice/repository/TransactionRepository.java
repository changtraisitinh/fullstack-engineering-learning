package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId);

    /**
     * Cumulative amount for a wallet across a set of transaction types since a given instant —
     * backs the monthly outbound-transaction limit (issue #7, Điều 26 Thông tư 40/2024/TT-NHNN,
     * sửa bởi Thông tư 41/2025/TT-NHNN). {@code COALESCE} handles the "no transactions yet this
     * month" case, which would otherwise sum to SQL NULL rather than 0.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
        + "WHERE t.walletId = :walletId AND t.type IN :types AND t.createdAt >= :since")
    BigDecimal sumAmountByWalletIdAndTypeInSince(@Param("walletId") UUID walletId,
                                                  @Param("types") Collection<TransactionType> types,
                                                  @Param("since") Instant since);

    /** Issue #16 — spending report, same sum but bounded on both sides: [from, to). */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
        + "WHERE t.walletId = :walletId AND t.type IN :types AND t.createdAt >= :from AND t.createdAt < :to")
    BigDecimal sumAmountByWalletIdAndTypeInBetween(@Param("walletId") UUID walletId,
                                                    @Param("types") Collection<TransactionType> types,
                                                    @Param("from") Instant from,
                                                    @Param("to") Instant to);

    interface TypeTotalRow {
        TransactionType getType();

        BigDecimal getTotal();

        long getTxCount();
    }

    /** Issue #16 — per-type totals for [from, to), aggregated in SQL rather than in Java. */
    @Query("SELECT t.type AS type, SUM(t.amount) AS total, COUNT(t) AS txCount FROM Transaction t "
        + "WHERE t.walletId = :walletId AND t.type IN :types AND t.createdAt >= :from AND t.createdAt < :to "
        + "GROUP BY t.type")
    List<TypeTotalRow> sumByType(@Param("walletId") UUID walletId,
                                 @Param("types") Collection<TransactionType> types,
                                 @Param("from") Instant from,
                                 @Param("to") Instant to);
}
