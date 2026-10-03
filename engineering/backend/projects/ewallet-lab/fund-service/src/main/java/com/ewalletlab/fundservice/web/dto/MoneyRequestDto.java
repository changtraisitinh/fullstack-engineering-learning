package com.ewalletlab.fundservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Contribution or withdrawal. Upper bound = the 100.000.000đ/lần P2P cap transfer-service already
 * applies (issue #6) — a contribution is money moving to other people's shared pot, so it gets the
 * same per-transaction ceiling rather than a new invented one.
 */
public record MoneyRequestDto(
    @NotNull UUID userId,
    @NotNull @DecimalMin("1000") @DecimalMax("100000000") @Digits(integer = 15, fraction = 0) BigDecimal amount
) {
}
