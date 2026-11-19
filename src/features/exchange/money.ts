import type { Currency } from './types';

const moneyFormats: Record<Currency, Intl.NumberFormat> = {
  PEN: new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }),
  USD: new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }),
};

const rateFormat = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 4,
});

const dateFormat = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatMoney(value: number, currency: Currency): string {
  return moneyFormats[currency].format(value);
}

export function formatRate(rate: number): string {
  return rateFormat.format(rate);
}

/** The date and time in the user's own time zone. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date);
}
