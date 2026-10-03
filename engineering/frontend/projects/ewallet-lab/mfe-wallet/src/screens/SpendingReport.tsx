import { ApiError, type SpendType, type SpendingReport as Report, walletService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Card, Icon, ProgressBar, Screen, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

/**
 * Issue #16 — "Quản lý chi tiêu", MVP = the automatic weekly/monthly report only (the "Báo cáo" tab
 * of momo.vn/quan-ly-chi-tieu). Built 100% from the existing ledger: no custom categories, no
 * budgets, no chatbot, no manual entries (all out of scope — see frontend DESIGN.md §11).
 *
 * "Chi tiêu" = Chuyển tiền đi + Thanh toán hoá đơn + Rút tiền, the same definition Home.tsx's
 * monthly card uses. Money coming in (Nạp tiền, Nhận tiền, Hoàn tiền) is never counted.
 */
const TYPE_META: Record<SpendType, { icon: string; label: string; color: string }> = {
  TRANSFER_OUT: { icon: 'north_east', label: 'Chuyển tiền đi', color: 'var(--el-accent)' },
  BILL_PAYMENT: { icon: 'receipt_long', label: 'Thanh toán hoá đơn', color: 'var(--el-amber)' },
  WITHDRAW: { icon: 'north', label: 'Rút tiền về ngân hàng', color: 'var(--el-accent-ink)' },
};

type Period = 'week' | 'month';

function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Previous window ends exactly where the current one starts — show its last day, not the next. */
function formatDayBefore(iso: string): string {
  return formatDay(new Date(new Date(iso).getTime() - 1).toISOString());
}

function Comparison({ report, period }: { report: Report; period: Period }) {
  const prevLabel = period === 'week' ? 'tuần trước' : 'tháng trước';
  if (report.previousTotal === 0) {
    return (
      <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '8px 0 0' }}>
        Không có chi tiêu nào trong {prevLabel} để so sánh.
      </p>
    );
  }
  const diff = report.total - report.previousTotal;
  const pct = Math.round((Math.abs(diff) / report.previousTotal) * 100);
  return (
    <p style={{ fontSize: 12.5, color: 'var(--el-muted)', margin: '8px 0 0' }}>
      {diff === 0 ? 'Bằng' : diff > 0 ? `Nhiều hơn ${pct}% so với` : `Ít hơn ${pct}% so với`} cả {prevLabel} (
      {formatVnd(report.previousTotal)}, {formatDay(report.previousFrom)}–{formatDayBefore(report.previousTo)}).{' '}
      <span style={{ color: 'var(--el-faint)' }}>Kỳ này chưa kết thúc.</span>
    </p>
  );
}

/** Exposed as `./SpendingReport` (see vite.config.ts). */
export default function SpendingReport({ session, onBack }: { session: Session; onBack: () => void }) {
  const [period, setPeriod] = useState<Period>('month');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    setReport(null);
    setError(undefined);
    walletService
      .getSpendingReport(session.id, period)
      .then((r) => !cancelled && setReport(r))
      .catch((e) => !cancelled && setError(describeApiError(e instanceof ApiError ? e.status : undefined, 'spending-report')));
    return () => {
      cancelled = true;
    };
  }, [session.id, period]);

  const max = report ? Math.max(...report.breakdown.map((b) => b.amount), 0) : 0;

  return (
    <Screen title="Quản lý chi tiêu" withNavGutter={false}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <div role="tablist" style={{ display: 'flex', gap: 6, background: 'var(--el-surface-2)', borderRadius: 12, padding: 4, marginBottom: 16 }}>
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1,
              border: 0,
              borderRadius: 9,
              padding: '9px 0',
              fontFamily: 'var(--el-font-display)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              background: period === p ? 'var(--el-surface)' : 'transparent',
              color: period === p ? 'var(--el-accent-ink)' : 'var(--el-muted)',
              boxShadow: period === p ? 'var(--el-shadow)' : 'none',
            }}
          >
            {p === 'week' ? 'Tuần này' : 'Tháng này'}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--el-danger)', fontSize: 13, fontWeight: 600 }}>{error}</p>}
      {!report && !error && <ProgressBar label="Đang tổng hợp chi tiêu…" />}

      {report && (
        <>
          <Card>
            <div style={{ fontSize: 12, color: 'var(--el-faint)' }}>
              Tổng chi {formatDay(report.from)}–{formatDay(report.to)} · {report.count} giao dịch
            </div>
            <div style={{ fontFamily: 'var(--el-font-display)', fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {formatVnd(report.total)}
            </div>
            <Comparison report={report} period={period} />
          </Card>

          <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>
            Theo loại giao dịch
          </h2>
          <Card>
            {report.breakdown.map((b) => {
              const meta = TYPE_META[b.type];
              const share = report.total > 0 ? Math.round((b.amount / report.total) * 100) : 0;
              return (
                <div key={b.type} style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Icon name={meta.icon} size={18} style={{ color: meta.color }} />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>
                      {meta.label}
                      <span style={{ color: 'var(--el-faint)', fontWeight: 400 }}> · {b.count} GD</span>
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatVnd(b.amount)}</span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${meta.label}: ${share}% tổng chi`}
                    style={{ height: 8, borderRadius: 4, background: 'var(--el-line)', overflow: 'hidden' }}
                  >
                    <div style={{ width: `${max > 0 ? (b.amount / max) * 100 : 0}%`, height: '100%', background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '12px 0 0', lineHeight: 1.5 }}>
            Chỉ tính tiền ra khỏi ví: chuyển tiền đi, thanh toán hoá đơn, rút tiền. Nạp tiền, nhận tiền, hoàn tiền và trả nợ
            Ví Trả Sau không được tính là chi tiêu. Danh mục tự đặt, ngân sách và trợ lý chi tiêu chưa có trong lab.
          </p>
        </>
      )}
    </Screen>
  );
}
