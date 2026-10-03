import { ApiError, FUND_MAX_AMOUNT, FUND_MIN_AMOUNT, type Fund, type FundSummary, fundService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { Button, Card, Icon, Screen, TextField, describeApiError, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

const PHONE_RE = /^0\d{9}$/;

/**
 * Issue #14 — "Quỹ nhóm" MVP (fund-service :8100): create a fund, invite existing Ewallet Lab users
 * by phone, every member contributes from their own wallet, transparent per-person history, and
 * only the creator can withdraw (deliberate MVP limit). No interest ("Sinh lời") — out of scope.
 * UX is designed from generic e-wallet logic: the real momo.vn/quy-nhom page was only ever seen via
 * search snippets (see frontend DESIGN.md §13).
 */
function errorOf(e: unknown): string {
  return describeApiError(e instanceof ApiError ? e.status : undefined, 'fund');
}

function parseAmount(raw: string): number | string {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < FUND_MIN_AMOUNT || n > FUND_MAX_AMOUNT) {
    return `Nhập số tiền nguyên từ ${formatVnd(FUND_MIN_AMOUNT)} đến ${formatVnd(FUND_MAX_AMOUNT)}.`;
  }
  return n;
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 0, color: 'var(--el-muted)', fontSize: 13, padding: 0, marginBottom: 16, cursor: 'pointer' }}
    >
      ← Quay lại
    </button>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 style={{ fontFamily: 'var(--el-font-display)', fontSize: 14.5, fontWeight: 700, margin: '20px 0 8px' }}>{children}</h2>;
}

function FundList({ session, onOpen }: { session: Session; onOpen: (id: string) => void }) {
  const [funds, setFunds] = useState<FundSummary[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [createError, setCreateError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fundService.listMine(session.id).then(setFunds).catch((e) => setError(errorOf(e)));
  }, [session.id]);

  async function handleCreate() {
    if (!name.trim()) {
      setCreateError('Đặt tên cho quỹ.');
      return;
    }
    setCreateError(undefined);
    setBusy(true);
    try {
      const fund = await fundService.create(session.id, session.name, session.phone, name.trim(), purpose.trim());
      onOpen(fund.id);
    } catch (e) {
      setCreateError(errorOf(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SectionTitle>Quỹ của bạn</SectionTitle>
      {error && <p style={{ color: 'var(--el-danger)', fontSize: 13, fontWeight: 600 }}>{error}</p>}
      {funds && funds.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Bạn chưa tham gia quỹ nào. Tạo quỹ mới bên dưới.</p>
      )}
      {funds?.map((f) => (
        <button
          key={f.id}
          onClick={() => onOpen(f.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            textAlign: 'left',
            background: 'var(--el-surface)',
            border: '1px solid var(--el-line)',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 10,
            cursor: 'pointer',
            color: 'inherit',
          }}
        >
          <Icon name="groups" style={{ color: 'var(--el-accent)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{f.name}</div>
            <div style={{ fontSize: 12, color: 'var(--el-faint)' }}>
              {f.creatorUserId === session.id ? 'Bạn là người tạo' : `Tạo bởi ${f.creatorName}`}
            </div>
          </div>
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{formatVnd(f.balance)}</strong>
        </button>
      ))}

      <SectionTitle>Tạo quỹ mới</SectionTitle>
      <Card>
        <TextField id="fund-name" label="Tên quỹ" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} error={createError} />
        <TextField id="fund-purpose" label="Mục đích (tuỳ chọn)" maxLength={300} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        <Button disabled={busy} onClick={handleCreate}>
          {busy ? 'Đang tạo…' : 'Tạo quỹ'}
        </Button>
      </Card>
    </>
  );
}

function FundDetail({ session, fundId, onBack }: { session: Session; fundId: string; onBack: () => void }) {
  const [fund, setFund] = useState<Fund | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [phone, setPhone] = useState('');
  const [inviteError, setInviteError] = useState<string | undefined>();
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | undefined>();
  const [busy, setBusy] = useState<'invite' | 'contribute' | 'withdraw' | null>(null);
  const [notice, setNotice] = useState<string | undefined>();

  function reload() {
    fundService.get(fundId, session.id).then(setFund).catch((e) => setError(errorOf(e)));
  }

  useEffect(reload, [fundId, session.id]);

  const isCreator = fund?.creatorUserId === session.id;

  async function handleInvite() {
    if (!PHONE_RE.test(phone)) {
      setInviteError('Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.');
      return;
    }
    setInviteError(undefined);
    setBusy('invite');
    try {
      setFund(await fundService.invite(fundId, session.id, phone));
      setNotice(`Đã thêm ${phone} vào quỹ.`);
      setPhone('');
    } catch (e) {
      setInviteError(errorOf(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleMoney(kind: 'contribute' | 'withdraw') {
    const parsed = parseAmount(amount);
    if (typeof parsed === 'string') {
      setAmountError(parsed);
      return;
    }
    if (kind === 'withdraw' && fund && parsed > fund.balance) {
      setAmountError(`Số dư quỹ chỉ còn ${formatVnd(fund.balance)}.`);
      return;
    }
    setAmountError(undefined);
    setBusy(kind);
    try {
      const next = kind === 'contribute' ? await fundService.contribute(fundId, session.id, parsed) : await fundService.withdraw(fundId, session.id, parsed);
      setFund(next);
      setAmount('');
      setNotice(kind === 'contribute' ? `Đã góp ${formatVnd(parsed)} từ ví của bạn.` : `Đã rút ${formatVnd(parsed)} về ví của bạn.`);
    } catch (e) {
      setAmountError(errorOf(e));
      reload();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <BackLink onClick={onBack} />
      {error && <p style={{ color: 'var(--el-danger)', fontSize: 13, fontWeight: 600 }}>{error}</p>}
      {!fund && !error && <p style={{ fontSize: 13, color: 'var(--el-muted)' }}>Đang tải quỹ…</p>}
      {fund && (
        <>
          <Card>
            <div style={{ fontSize: 12, color: 'var(--el-faint)' }}>{fund.name}</div>
            <div style={{ fontFamily: 'var(--el-font-display)', fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {formatVnd(fund.balance)}
            </div>
            {fund.purpose && <div style={{ fontSize: 12.5, color: 'var(--el-muted)', marginTop: 4 }}>{fund.purpose}</div>}
            <div style={{ fontSize: 12, color: 'var(--el-faint)', marginTop: 6 }}>
              {fund.members.length} thành viên · tạo bởi {fund.creatorName}
            </div>
          </Card>

          {notice && (
            <p role="status" style={{ fontSize: 13, color: 'var(--el-accent-ink)', fontWeight: 600, margin: '12px 0 0' }}>
              {notice}
            </p>
          )}

          <SectionTitle>{isCreator ? 'Góp hoặc rút tiền' : 'Góp tiền vào quỹ'}</SectionTitle>
          <Card>
            <TextField
              id="fund-amount"
              label="Số tiền"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              error={amountError}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button disabled={busy !== null} onClick={() => handleMoney('contribute')}>
                {busy === 'contribute' ? 'Đang trừ tiền ví…' : 'Góp từ ví của tôi'}
              </Button>
              {isCreator && (
                <Button variant="secondary" disabled={busy !== null || fund.balance === 0} onClick={() => handleMoney('withdraw')}>
                  {busy === 'withdraw' ? 'Đang cộng tiền ví…' : 'Rút về ví của tôi'}
                </Button>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--el-faint)', margin: '10px 0 0' }}>
              {isCreator
                ? 'Chỉ người tạo quỹ được rút tiền (giới hạn của bản thử nghiệm).'
                : `Chỉ người tạo quỹ (${fund.creatorName}) được rút tiền khỏi quỹ.`}
            </p>
          </Card>

          <SectionTitle>Thành viên & đóng góp</SectionTitle>
          <Card>
            {fund.members.map((m) => (
              <div key={m.userId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 0', fontSize: 13.5 }}>
                <span>
                  <strong>{m.name}</strong>
                  {m.userId === session.id ? ' (bạn)' : ''}
                  {m.creator ? <span style={{ color: 'var(--el-faint)' }}> · người tạo</span> : null}
                </span>
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatVnd(m.contributed)}</span>
              </div>
            ))}
            {isCreator && (
              <div style={{ marginTop: 12 }}>
                <TextField
                  id="fund-invite-phone"
                  label="Mời thành viên (SĐT đã có tài khoản Ewallet Lab)"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={inviteError}
                />
                <Button variant="ghost" disabled={busy !== null} onClick={handleInvite}>
                  {busy === 'invite' ? 'Đang mời…' : 'Thêm vào quỹ'}
                </Button>
              </div>
            )}
          </Card>

          <SectionTitle>Lịch sử quỹ</SectionTitle>
          <Card>
            {fund.history.length === 0 && <p style={{ fontSize: 13, color: 'var(--el-muted)', margin: 0 }}>Chưa có giao dịch nào.</p>}
            {fund.history.slice(0, 30).map((h) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--el-line)' }}>
                <Icon name={h.kind === 'CONTRIBUTION' ? 'south_west' : 'north_east'} size={18} style={{ color: 'var(--el-accent)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {h.userName} {h.kind === 'CONTRIBUTION' ? 'góp' : 'rút'}
                    {h.status === 'FAILED' ? ' (thất bại)' : h.status === 'PENDING' ? ' (đang xử lý)' : ''}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--el-faint)' }}>{new Date(h.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    textDecoration: h.status === 'FAILED' ? 'line-through' : undefined,
                  }}
                >
                  {h.kind === 'CONTRIBUTION' ? '+' : '−'}
                  {formatVnd(h.amount)}
                </span>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}

export function FundHome({ session, onBack }: { session: Session; onBack: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <Screen title="Quỹ nhóm" withNavGutter={false}>
      {openId ? (
        <FundDetail session={session} fundId={openId} onBack={() => setOpenId(null)} />
      ) : (
        <>
          <BackLink onClick={onBack} />
          <FundList session={session} onOpen={setOpenId} />
        </>
      )}
    </Screen>
  );
}
