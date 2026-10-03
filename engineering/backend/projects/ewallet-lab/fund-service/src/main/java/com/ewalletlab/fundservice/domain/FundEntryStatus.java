package com.ewalletlab.fundservice.domain;

public enum FundEntryStatus {
    PENDING,
    COMPLETED,
    /** The wallet-service call failed — nothing moved (contribution), or the fund balance was given
     * back (withdrawal). */
    FAILED
}
