import { API_BASE, http } from './http';

export type WalletResponse = {
  userId: string;
  balance: number;
};

export type TransactionType =
  | 'TOPUP'
  | 'WITHDRAW'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'BILL_PAYMENT'
  | 'BNPL_REPAYMENT';

export type Transaction = {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
};

/** Issue #16 — "chi tiêu" is exactly these 3 types (wallet-service SpendingReportService.SPEND_TYPES). */
export type SpendType = 'TRANSFER_OUT' | 'BILL_PAYMENT' | 'WITHDRAW';

export type SpendingReport = {
  period: 'WEEK' | 'MONTH';
  from: string;
  to: string;
  total: number;
  count: number;
  breakdown: { type: SpendType; amount: number; count: number }[];
  previousFrom: string;
  previousTo: string;
  previousTotal: number;
};

export const walletService = {
  getBalance: (userId: string) => http.get<WalletResponse>(`${API_BASE.wallet}/wallets/${userId}/balance`),

  getTransactions: (userId: string) =>
    http.get<Transaction[]>(`${API_BASE.wallet}/wallets/${userId}/transactions`),

  getSpendingReport: (userId: string, period: 'week' | 'month') =>
    http.get<SpendingReport>(`${API_BASE.wallet}/wallets/${userId}/spending-report?period=${period}`),
};
