import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validateLoginPassword,
  validateName,
  validateNewPassword,
} from './validation';

describe('validateEmail', () => {
  it('accepts a valid email, ignoring surrounding spaces', () => {
    expect(validateEmail('  juan@example.com ')).toBeNull();
  });

  it.each([
    ['', 'Ingresa tu correo.'],
    ['   ', 'Ingresa tu correo.'],
    ['no-es-un-correo', 'Ingresa un correo válido.'],
    ['juan@', 'Ingresa un correo válido.'],
  ])('rejects "%s"', (value, message) => {
    expect(validateEmail(value)).toBe(message);
  });
});

describe('validateNewPassword', () => {
  it('accepts a password of 8 to 72 characters', () => {
    expect(validateNewPassword('contraseña123')).toBeNull();
    expect(validateNewPassword('a'.repeat(72))).toBeNull();
  });

  it('asks for a password, a minimum length and a maximum length', () => {
    expect(validateNewPassword('')).toBe('Crea una contraseña.');
    expect(validateNewPassword('corta')).toContain('al menos 8');
    expect(validateNewPassword('a'.repeat(73))).toContain('más de 72');
  });
});

describe('the other fields', () => {
  it('only asks the login password to be there', () => {
    expect(validateLoginPassword('x')).toBeNull();
    expect(validateLoginPassword('')).toBe('Ingresa tu contraseña.');
  });

  it('asks for a name', () => {
    expect(validateName('Juan')).toBeNull();
    expect(validateName('   ')).toBe('Ingresa tu nombre.');
  });
});
