import { describe, expect, it } from 'vitest';
import { redirectFor, safeRedirect } from './guard';

const privateRoute = { meta: {}, fullPath: '/historial?page=2' };
const publicRoute = { meta: { public: true }, fullPath: '/login' };

describe('redirectFor', () => {
  it('sends a visitor without a session to the login, remembering where they were going', () => {
    expect(redirectFor(privateRoute, false)).toEqual({
      name: 'login',
      query: { redirect: '/historial?page=2' },
    });
  });

  it('lets a user with a session into the app', () => {
    expect(redirectFor(privateRoute, true)).toBe(true);
  });

  it('does not show the login to a user who is already logged in', () => {
    expect(redirectFor(publicRoute, true)).toEqual({ name: 'exchange' });
  });

  it('lets a visitor see the login', () => {
    expect(redirectFor(publicRoute, false)).toBe(true);
  });
});

describe('safeRedirect', () => {
  it('accepts a path inside the app', () => {
    expect(safeRedirect('/historial?page=2')).toBe('/historial?page=2');
  });

  it.each([
    ['another site', 'https://evil.example.com'],
    ['a protocol-relative URL', '//evil.example.com'],
    ['a backslash trick', '/\\evil.example.com'],
    ['nothing', undefined],
    ['a list', ['/a', '/b']],
  ])('falls back to the home page for %s', (_name, value) => {
    expect(safeRedirect(value)).toBe('/');
  });
});
