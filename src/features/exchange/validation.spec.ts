import { describe, expect, it } from 'vitest';
import { validateAmount, validateCurrencies } from './validation';

describe('validateAmount', () => {
  it.each(['1', '100', '0.5', '373.90', '9999999.99', '0001', '  50  '])(
    'accepts "%s"',
    (amount) => {
      expect(validateAmount(amount)).toBeNull();
    },
  );

  it.each([
    ['', 'Ingresa el monto a cambiar.'],
    ['   ', 'Ingresa el monto a cambiar.'],
    ['abc', 'Ingresa un monto válido.'],
    ['1e5', 'Ingresa un monto válido.'],
    ['1.', 'Ingresa un monto válido.'],
    ['12,50', 'Usa punto (.) como separador decimal.'],
    ['0', 'El monto debe ser mayor a cero.'],
    ['0.00', 'El monto debe ser mayor a cero.'],
    ['-5', 'El monto debe ser mayor a cero.'],
    ['10000000', 'El monto no puede tener más de 7 dígitos enteros.'],
    ['1.234', 'El monto admite como máximo 2 decimales.'],
  ])('rejects "%s"', (amount, message) => {
    expect(validateAmount(amount)).toBe(message);
  });
});

describe('validateCurrencies', () => {
  it('asks for two different currencies', () => {
    expect(validateCurrencies('USD', 'PEN')).toBeNull();
    expect(validateCurrencies('PEN', 'PEN')).toContain('distintas');
  });
});
