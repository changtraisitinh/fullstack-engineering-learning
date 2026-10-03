package com.ewalletlab.fundservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * wallet-service's own /debit (member → fund) and /credit (fund → creator) — never a private
 * money path (issue #14 Constraints). Reuses existing TransactionType values, like
 * lucky-money-service: TRANSFER_OUT for a contribution (money leaving the member's wallet to the
 * group — it does count towards the #7 monthly cap, as a P2P transfer would) and TRANSFER_IN for a
 * withdrawal. No new enum value → no CHECK-constraint ALTER needed.
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record WalletResult(UUID userId, BigDecimal balance) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note) {
    }

    public WalletResult debitContribution(UUID userId, BigDecimal amount, UUID entryId, String fundName) {
        return adjust(userId, "debit", new AdjustBalanceRequest(amount, "TRANSFER_OUT", entryId.toString(), "Góp quỹ nhóm \"" + fundName + "\""));
    }

    public WalletResult creditWithdrawal(UUID userId, BigDecimal amount, UUID entryId, String fundName) {
        return adjust(userId, "credit", new AdjustBalanceRequest(amount, "TRANSFER_IN", entryId.toString(), "Rút từ quỹ nhóm \"" + fundName + "\""));
    }

    private WalletResult adjust(UUID userId, String action, AdjustBalanceRequest body) {
        return restClient.post()
            .uri("/wallets/{userId}/{action}", userId, action)
            .body(body)
            .retrieve()
            .body(WalletResult.class);
    }
}
