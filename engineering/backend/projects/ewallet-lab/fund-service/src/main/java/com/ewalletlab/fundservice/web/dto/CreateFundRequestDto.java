package com.ewalletlab.fundservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/** creatorName/creatorPhone come from the creator's own session — same trust model as
 * lucky-money-service's fromName. */
public record CreateFundRequestDto(
    @NotNull UUID creatorUserId,
    @NotBlank String creatorName,
    String creatorPhone,
    @NotBlank @Size(max = 100) String name,
    @Size(max = 300) String purpose
) {
}
