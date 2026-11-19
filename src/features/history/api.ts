import { requestWithHeaders } from '../../shared/api/http';
import type { TransactionResponse } from '../exchange/types';
import type { DayRange } from './range';

/** The days to look at and, only for an admin, the user whose history is wanted. */
export type HistoryFilters = DayRange & { userId?: string };

export interface HistoryPage {
  items: TransactionResponse[];
  total: number;
}

export async function getHistory(
  range: HistoryFilters,
  page: number,
  pageSize: number,
): Promise<HistoryPage> {
  const { data, headers } = await requestWithHeaders<TransactionResponse[]>(
    '/v1/transactions/history',
    { query: { ...range, page: String(page), limit: String(pageSize) } },
  );
  return { items: data, total: totalOf(headers, data.length) };
}

function totalOf(headers: Headers, fallback: number): number {
  const header = headers.get('X-Total-Count');
  if (header === null || header.trim() === '') return fallback;
  const total = Number(header);
  return Number.isInteger(total) && total >= 0 ? total : fallback;
}
