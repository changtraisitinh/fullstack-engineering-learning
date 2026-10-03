package com.ewalletlab.fundservice.web;

import com.ewalletlab.fundservice.service.FundService;
import com.ewalletlab.fundservice.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** Issue #14 — same public, userId-in-body/path convention as the rest of this lab (no auth). */
@RestController
@RequestMapping("/funds")
public class FundController {

    private final FundService service;

    public FundController(FundService service) {
        this.service = service;
    }

    @PostMapping
    public FundDto create(@Valid @RequestBody CreateFundRequestDto r) {
        return FundDto.from(service.create(r.name(), r.purpose(), r.creatorUserId(), r.creatorName(), r.creatorPhone()));
    }

    @GetMapping("/member/{userId}")
    public List<FundDto.SummaryDto> listForMember(@PathVariable UUID userId) {
        return service.listForMember(userId).stream().map(FundDto.SummaryDto::from).toList();
    }

    @GetMapping("/{fundId}")
    public FundDto get(@PathVariable UUID fundId, @RequestParam UUID userId) {
        return FundDto.from(service.detailFor(fundId, userId));
    }

    @PostMapping("/{fundId}/members")
    public FundDto invite(@PathVariable UUID fundId, @Valid @RequestBody InviteRequestDto r) {
        return FundDto.from(service.invite(fundId, r.requesterUserId(), r.phone()));
    }

    @PostMapping("/{fundId}/contributions")
    public FundDto contribute(@PathVariable UUID fundId, @Valid @RequestBody MoneyRequestDto r) {
        return FundDto.from(service.contribute(fundId, r.userId(), r.amount()));
    }

    @PostMapping("/{fundId}/withdrawals")
    public FundDto withdraw(@PathVariable UUID fundId, @Valid @RequestBody MoneyRequestDto r) {
        return FundDto.from(service.withdraw(fundId, r.userId(), r.amount()));
    }

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<String> handleLockFailure(PessimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Quỹ đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
