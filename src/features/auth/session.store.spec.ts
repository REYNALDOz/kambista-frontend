import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from './api';
import { useSession } from './session.store';

vi.mock('./api');

const juan = {
  id: 'u1',
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  rol: 'user' as const,
};

describe('session store', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: 'token-1',
      usuario: juan,
    });
  });

  it('keeps the token and the user after logging in', async () => {
    const session = useSession();

    await session.login('juan@example.com', 'contraseña123');

    expect(session.isAuthenticated).toBe(true);
    expect(session.token).toBe('token-1');
    expect(session.user).toEqual(juan);
  });

  it('does not log in when the API rejects the credentials', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new Error('Correo o contraseña incorrectos.'),
    );
    const session = useSession();

    await expect(session.login('juan@example.com', 'mala')).rejects.toThrow(
      'incorrectos',
    );
    expect(session.isAuthenticated).toBe(false);
  });

  it('restores the session after a page reload', async () => {
    await useSession().login('juan@example.com', 'contraseña123');

    setActivePinia(createPinia()); // a new page load: empty memory, same browser storage
    const restored = useSession();

    expect(restored.isAuthenticated).toBe(true);
    expect(restored.user?.nombre).toBe('Juan Pérez');
  });

  it('forgets everything when logging out, also after a reload', async () => {
    const session = useSession();
    await session.login('juan@example.com', 'contraseña123');

    session.logout();
    setActivePinia(createPinia());

    expect(session.isAuthenticated).toBe(false);
    expect(useSession().isAuthenticated).toBe(false);
  });
});
