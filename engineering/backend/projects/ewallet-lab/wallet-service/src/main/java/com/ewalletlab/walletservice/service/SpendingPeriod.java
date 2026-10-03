package com.ewalletlab.walletservice.service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.Locale;

/**
 * Issue #16 — the two report periods. Both are calendar-based (not rolling windows), in the same
 * timezone the monthly outbound limit (issue #7, {@code WalletMutationExecutor.currentMonthStart})
 * already uses, so "tháng này" means exactly the same thing in the report as in the limit check.
 */
public enum SpendingPeriod {
    /** Monday 00:00 of the current week (Vietnamese week starts on Monday). */
    WEEK,
    /** Day 1 00:00 of the current calendar month. */
    MONTH;

    public record Window(Instant from, Instant to) {
    }

    /** Current period so far: [start of period, now). */
    public Window current(LocalDate today, Instant now, ZoneId zone) {
        return new Window(startOf(today).atStartOfDay(zone).toInstant(), now);
    }

    /** The whole previous period: [start of previous period, start of current period). */
    public Window previous(LocalDate today, ZoneId zone) {
        LocalDate start = startOf(today);
        LocalDate prevStart = this == WEEK ? start.minusWeeks(1) : start.minusMonths(1);
        return new Window(prevStart.atStartOfDay(zone).toInstant(), start.atStartOfDay(zone).toInstant());
    }

    LocalDate startOf(LocalDate today) {
        return this == WEEK
            ? today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
            : today.withDayOfMonth(1);
    }

    /** Accepts {@code week|month} (any case); anything else is a 400 at the controller. */
    public static SpendingPeriod parse(String value) {
        return valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
