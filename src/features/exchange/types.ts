export type Currency = 'USD' | 'PEN';

/** An exchange, as the API returns it (the history lists these same objects). */
export interface TransactionResponse {
  id: string;
  monedaOrigen: Currency;
  monedaDestino: Currency;
  monto: number;
  montoCambiado: number;
  tipoCambio: number;
  fecha: string;
}
