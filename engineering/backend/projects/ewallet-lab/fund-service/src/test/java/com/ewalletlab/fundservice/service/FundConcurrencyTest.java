package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.FundEntryKind;
import com.ewalletlab.fundservice.domain.FundEntryStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Issue #14's mandatory concurrency tests (≥8 concurrent contributions/withdrawals), run through the
 * real HTTP stack with only user-service/wallet-service mocked, plus the permission rules.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class FundConcurrencyTest {

    @Autowired
    FundService service;

    @MockitoBean
    WalletServiceClient wallet;

    @MockitoBean
    UserServiceClient users;

    @LocalServerPort
    int port;

    private final HttpClient http = HttpClient.newHttpClient();

    private record Group(UUID fundId, UUID creator, UUID a, UUID b) {
    }

    /** Creator + 2 invited members (Acceptance criteria: ≥3 users). */
    private Group group() {
        UUID creator = UUID.randomUUID(), a = UUID.randomUUID(), b = UUID.randomUUID();
        when(users.findByPhone("0900000001")).thenReturn(new UserServiceClient.UserResponse(a, "0900000001", "An"));
        when(users.findByPhone("0900000002")).thenReturn(new UserServiceClient.UserResponse(b, "0900000002", "Bình"));
        UUID fundId = service.create("Du lịch Đà Lạt", "Tiền phòng + xe", creator, "Chủ quỹ", "0900000000").fund().getId();
        service.invite(fundId, creator, "0900000001");
        service.invite(fundId, creator, "0900000002");
        return new Group(fundId, creator, a, b);
    }

    private int post(String path, String json) throws Exception {
        return http.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json)).build(),
            HttpResponse.BodyHandlers.discarding()).statusCode();
    }

    @Test
    void concurrentContributionsFromAllMembersAddUpExactly() throws Exception {
        Group g = group();
        when(wallet.debitContribution(any(), any(), any(), any())).thenAnswer(inv -> {
            Thread.sleep(30);
            return new WalletServiceClient.WalletResult(inv.getArgument(0), BigDecimal.ZERO);
        });
        List<Callable<Integer>> calls = new ArrayList<>();
        for (UUID u : List.of(g.creator(), g.a(), g.b())) {
            for (int i = 0; i < 4; i++) {
                calls.add(() -> post("/funds/" + g.fundId() + "/contributions", "{\"userId\":\"" + u + "\",\"amount\":50000}"));
            }
        }
        List<Integer> statuses = race(calls);

        assertThat(statuses).hasSize(12).allMatch(s -> s == 200);
        var d = service.detailFor(g.fundId(), g.creator());
        assertThat(d.fund().getBalance()).isEqualByComparingTo("600000");
        assertThat(d.history()).filteredOn(e -> e.getStatus() == FundEntryStatus.COMPLETED).hasSize(12);
        verify(wallet, times(12)).debitContribution(any(), any(), any(), any());
    }

    @Test
    void concurrentWithdrawalsNeverPayOutMoreThanTheBalance() throws Exception {
        Group g = group();
        when(wallet.debitContribution(any(), any(), any(), any())).thenReturn(new WalletServiceClient.WalletResult(g.a(), BigDecimal.ZERO));
        service.contribute(g.fundId(), g.a(), new BigDecimal("300000"));
        when(wallet.creditWithdrawal(eq(g.creator()), any(), any(), any())).thenAnswer(inv -> {
            Thread.sleep(50);
            return new WalletServiceClient.WalletResult(g.creator(), BigDecimal.ZERO);
        });
        List<Callable<Integer>> calls = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            calls.add(() -> post("/funds/" + g.fundId() + "/withdrawals", "{\"userId\":\"" + g.creator() + "\",\"amount\":100000}"));
        }
        List<Integer> statuses = race(calls);

        assertThat(statuses).allMatch(s -> s == 200 || s == 409);
        assertThat(statuses).filteredOn(s -> s == 200).hasSize(3);
        verify(wallet, times(3)).creditWithdrawal(eq(g.creator()), any(), any(), any());
        assertThat(service.detailFor(g.fundId(), g.creator()).fund().getBalance()).isEqualByComparingTo("0");
    }

    @Test
    void permissions() throws Exception {
        Group g = group();
        UUID outsider = UUID.randomUUID();
        assertThat(post("/funds/" + g.fundId() + "/withdrawals", "{\"userId\":\"" + g.a() + "\",\"amount\":1000}")).isEqualTo(403);
        assertThat(post("/funds/" + g.fundId() + "/contributions", "{\"userId\":\"" + outsider + "\",\"amount\":1000}")).isEqualTo(403);
        assertThat(post("/funds/" + g.fundId() + "/members", "{\"requesterUserId\":\"" + g.a() + "\",\"phone\":\"0900000002\"}")).isEqualTo(403);
        assertThat(post("/funds/" + g.fundId() + "/members", "{\"requesterUserId\":\"" + g.creator() + "\",\"phone\":\"0900000001\"}")).isEqualTo(409);
        assertThatThrownBy(() -> service.detailFor(g.fundId(), outsider)).isInstanceOf(ResponseStatusException.class);
        assertThat(service.listForMember(g.b())).extracting(f -> f.getId()).containsExactly(g.fundId());
    }

    @Test
    void failedWalletCallsLeaveTheFundConsistent() {
        Group g = group();
        when(wallet.debitContribution(eq(g.a()), any(), any(), any())).thenThrow(HttpClientErrorException.create(
            HttpStatus.CONFLICT, "Conflict", HttpHeaders.EMPTY, "Số dư không đủ".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8));
        assertThatThrownBy(() -> service.contribute(g.fundId(), g.a(), new BigDecimal("50000")))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("Số dư không đủ");
        assertThat(service.detailFor(g.fundId(), g.a()).fund().getBalance()).isEqualByComparingTo("0");

        when(wallet.debitContribution(eq(g.b()), any(), any(), any())).thenReturn(new WalletServiceClient.WalletResult(g.b(), BigDecimal.ZERO));
        service.contribute(g.fundId(), g.b(), new BigDecimal("80000"));
        when(wallet.creditWithdrawal(any(), any(), any(), any())).thenThrow(new ResourceAccessException("down"));
        assertThatThrownBy(() -> service.withdraw(g.fundId(), g.creator(), new BigDecimal("80000"))).isInstanceOf(ResponseStatusException.class);

        var d = service.detailFor(g.fundId(), g.creator());
        assertThat(d.fund().getBalance()).isEqualByComparingTo("80000");
        assertThat(d.history()).filteredOn(e -> e.getStatus() == FundEntryStatus.FAILED).extracting(e -> e.getKind())
            .containsExactlyInAnyOrder(FundEntryKind.CONTRIBUTION, FundEntryKind.WITHDRAWAL);
    }

    private static <T> List<T> race(List<Callable<T>> calls) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(calls.size());
        CountDownLatch start = new CountDownLatch(1);
        List<Future<T>> futures = new ArrayList<>();
        for (Callable<T> c : calls) {
            futures.add(pool.submit(() -> {
                start.await();
                return c.call();
            }));
        }
        start.countDown();
        List<T> out = new ArrayList<>();
        for (Future<T> f : futures) out.add(f.get(60, TimeUnit.SECONDS));
        pool.shutdown();
        return out;
    }
}
