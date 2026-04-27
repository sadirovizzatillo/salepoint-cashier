import { createFetcher, BASE_URL } from './client';

const fetch = createFetcher(BASE_URL);

/* ── Clean types used by the UI ─────────────────────────────────────── */

export interface DebtCustomer {
  id: string;
  name: string;
  phone?: string | null;
}

export interface DebtCashier {
  id: string;
  name: string;
}

export interface DebtOrder {
  id: string;
  orderNumber: string;
}

export interface DebtRepayment {
  amount: number;
  note: string | null;
  createdAt: string;
  cashier: { name: string };
}

export interface Debt {
  id: string;
  status: 'pending' | 'partial' | 'paid';
  totalDebt: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: string;
  customer: DebtCustomer;
  cashier: DebtCashier;
  order: DebtOrder | null;
}

export interface DebtDetail extends Debt {
  repayments: DebtRepayment[];
}

export interface DebtsResponse {
  data: Debt[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface DebtsFilter {
  cashierId?: string;
  customerId?: string;
  shiftId?: string;
  status?: 'pending' | 'partial' | 'paid';
  page?: number;
  limit?: number;
}

export interface RepayPayload {
  amount: number;
  note?: string;
}

/* ── Raw API shapes (amounts come as strings, wrapped in { data }) ─── */

interface ApiDebtRaw {
  id: string;
  status: 'pending' | 'partial' | 'paid';
  totalDebt: string | number;
  paidAmount: string | number;
  remainingAmount: string | number;
  createdAt: string;
  customer: DebtCustomer;
  cashier: DebtCashier;
  order: DebtOrder | null;
  repayments?: Array<{
    amount: string | number;
    note: string | null;
    createdAt: string;
    cashier: { name: string };
  }>;
}

function mapDebt(raw: ApiDebtRaw): Debt {
  return {
    id:              raw.id,
    status:          raw.status,
    totalDebt:       Number(raw.totalDebt),
    paidAmount:      Number(raw.paidAmount),
    remainingAmount: Number(raw.remainingAmount),
    createdAt:       raw.createdAt,
    customer:        raw.customer,
    cashier:         raw.cashier,
    order:           raw.order,
  };
}

function mapDebtDetail(raw: ApiDebtRaw): DebtDetail {
  return {
    ...mapDebt(raw),
    repayments: (raw.repayments ?? []).map((r) => ({
      amount:    Number(r.amount),
      note:      r.note,
      createdAt: r.createdAt,
      cashier:   r.cashier,
    })),
  };
}

/* ── API calls ──────────────────────────────────────────────────────── */

export const listDebts = async (filters: DebtsFilter = {}): Promise<DebtsResponse> => {
  const q = new URLSearchParams();
  if (filters.cashierId)  q.set('cashierId',  filters.cashierId);
  if (filters.customerId) q.set('customerId', filters.customerId);
  if (filters.shiftId)    q.set('shiftId',    filters.shiftId);
  if (filters.status)     q.set('status',     filters.status);
  if (filters.page)       q.set('page',       String(filters.page));
  if (filters.limit)      q.set('limit',      String(filters.limit));

  const res = await fetch<any>(`/debts?${q}`);

  // Handle both { data: { data: [], meta: {} } } and { data: [], meta: {} }
  const unwrapped = res?.data ?? res;
  const list: ApiDebtRaw[] = Array.isArray(unwrapped?.data) ? unwrapped.data : (Array.isArray(unwrapped) ? unwrapped : []);
  const meta = unwrapped?.meta ?? { total: list.length, page: 1, limit: list.length };

  return { data: list.map(mapDebt), meta };
};

export const getDebt = async (id: string): Promise<DebtDetail> => {
  const res = await fetch<any>(`/debts/${id}`);
  // Unwrap { success, data, timestamp } envelope
  const raw: ApiDebtRaw = res?.data ?? res;
  return mapDebtDetail(raw);
};

export const repayDebt = async (id: string, payload: RepayPayload): Promise<DebtDetail> => {
  const res = await fetch<any>(`/debts/${id}/repay`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  const raw: ApiDebtRaw = res?.data ?? res;
  return mapDebtDetail(raw);
};
