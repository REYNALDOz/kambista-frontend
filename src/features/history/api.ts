import { request } from '../../shared/api/http';
import type { TransactionResponse } from '../exchange/types';
import type { DayRange } from './range';

/** The user's own exchanges between two instants, newest first. */
export function getHistory(range: DayRange): Promise<TransactionResponse[]> {
  return request<TransactionResponse[]>('/v1/transactions/history', {
    query: range,
  });
}
