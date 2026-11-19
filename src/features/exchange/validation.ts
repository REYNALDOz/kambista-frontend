import type { Currency } from './types';

// The limits of the challenge: at most 7 integer digits and 2 decimals (9,999,999.99).
const MAX_INTEGER_DIGITS = 7;
const MAX_DECIMALS = 2;
const NUMBER_PATTERN = /^\d+(\.\d+)?$/;

/** Returns the message to show, or `null` when the amount is fine. */
export function validateAmount(raw: string): string | null {
  const amount = raw.trim();
  if (amount === '') return 'Ingresa el monto a cambiar.';
  if (/^\d+,\d+$/.test(amount)) return 'Usa punto (.) como separador decimal.';
  if (amount.startsWith('-')) return 'El monto debe ser mayor a cero.';
  if (!NUMBER_PATTERN.test(amount)) return 'Ingresa un monto válido.';

  const [integerPart, decimalPart = ''] = amount.split('.');
  if (/^0*$/.test(integerPart) && /^0*$/.test(decimalPart)) {
    return 'El monto debe ser mayor a cero.';
  }
  if (integerPart.replace(/^0+/, '').length > MAX_INTEGER_DIGITS) {
    return `El monto no puede tener más de ${MAX_INTEGER_DIGITS} dígitos enteros.`;
  }
  if (decimalPart.length > MAX_DECIMALS) {
    return `El monto admite como máximo ${MAX_DECIMALS} decimales.`;
  }
  return null;
}

export function validateCurrencies(
  from: Currency,
  to: Currency,
): string | null {
  return from === to
    ? 'La moneda que envías y la que recibes deben ser distintas.'
    : null;
}
