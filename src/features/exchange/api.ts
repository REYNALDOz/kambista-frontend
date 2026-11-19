import { request } from '../../shared/api/http';
import type { Currency, TransactionResponse } from './types';

export interface CreateTransactionPayload {
  monedaOrigen: Currency;
  monedaDestino: Currency;
  monto: number;
}

export function createTransaction(
  payload: CreateTransactionPayload,
): Promise<TransactionResponse> {
  return request<TransactionResponse>('/v1/transactions', {
    method: 'POST',
    body: payload,
  });
}
