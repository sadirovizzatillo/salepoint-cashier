import { createFetcher, BASE_URL } from './client';

const fetch = createFetcher(BASE_URL);

export interface ShiftCashier {
  id: string;
  name: string;
  email?: string;
}

export interface Shift {
  id: string;
  status: 'open' | 'closed';
  openingFloat: number | string;
  closingFloat?: number | string | null;
  notes?: string | null;
  cashSales: number | string;
  cardSales: number | string;
  totalSales: number | string;
  orderCount: number;
  openedAt: string;
  closedAt?: string | null;
  cashier?: ShiftCashier;
}

export const getActiveShift = async (): Promise<Shift | null> => {
  const res = await fetch<Shift | { data: Shift | null } | null>('/shifts/active');
  if (!res) return null;
  // unwrap { data: Shift } if needed
  if (typeof res === 'object' && 'data' in res) return (res as { data: Shift | null }).data;
  return res as Shift;
};

export const openShift = async (openingFloat: number, notes?: string): Promise<Shift> => {
  const res = await fetch<any>('/shifts/open', {
    method: 'POST',
    body: JSON.stringify({
      openingFloat,
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
    }),
  });
  return res?.data ?? res;
};

export const closeShift = async (shiftId: string, closingFloat: number, notes?: string): Promise<Shift> => {
  const res = await fetch<any>(`/shifts/${shiftId}/close`, {
    method: 'POST',
    body: JSON.stringify({
      closingFloat,
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
    }),
  });
  return res?.data ?? res;
};

/** Always check for an active shift first — only open a new one if none exists */
export async function getOrOpenShift(openingFloat: number, notes?: string): Promise<Shift> {
  const active = await getActiveShift();
  if (active) return active;
  return openShift(openingFloat, notes);
}
