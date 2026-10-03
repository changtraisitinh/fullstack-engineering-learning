import { API_BASE, http } from './http';

/** Issue #14 — "Quỹ nhóm" (fund-service). MVP: only the creator may invite members and withdraw. */
export type FundEntry = {
  id: string;
  userId: string;
  userName: string;
  kind: 'CONTRIBUTION' | 'WITHDRAWAL';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
};

export type FundMember = { userId: string; name: string; phone: string | null; creator: boolean; contributed: number; joinedAt: string };

export type Fund = {
  id: string;
  name: string;
  purpose: string | null;
  creatorUserId: string;
  creatorName: string;
  balance: number;
  createdAt: string;
  members: FundMember[];
  history: FundEntry[];
};

export type FundSummary = Omit<Fund, 'members' | 'history'>;

/** Mirrors fund-service's MoneyRequestDto (same per-transaction cap as P2P transfer, issue #6). */
export const FUND_MIN_AMOUNT = 1000;
export const FUND_MAX_AMOUNT = 100_000_000;

export const fundService = {
  listMine: (userId: string) => http.get<FundSummary[]>(`${API_BASE.fund}/funds/member/${userId}`),

  get: (fundId: string, userId: string) => http.get<Fund>(`${API_BASE.fund}/funds/${fundId}?userId=${userId}`),

  create: (creatorUserId: string, creatorName: string, creatorPhone: string, name: string, purpose: string) =>
    http.post<Fund>(`${API_BASE.fund}/funds`, { creatorUserId, creatorName, creatorPhone, name, purpose }),

  invite: (fundId: string, requesterUserId: string, phone: string) =>
    http.post<Fund>(`${API_BASE.fund}/funds/${fundId}/members`, { requesterUserId, phone }),

  contribute: (fundId: string, userId: string, amount: number) =>
    http.post<Fund>(`${API_BASE.fund}/funds/${fundId}/contributions`, { userId, amount }),

  withdraw: (fundId: string, userId: string, amount: number) =>
    http.post<Fund>(`${API_BASE.fund}/funds/${fundId}/withdrawals`, { userId, amount }),
};
