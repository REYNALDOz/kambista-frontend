import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSession } from '../features/auth/session.store';
import { router } from './index';

describe('router', () => {
  beforeEach(async () => {
    localStorage.clear();
    setActivePinia(createPinia());
    useSession().logout();
    await router.push('/login');
  });

  it('sends an unknown address to the login when there is no session', async () => {
    await router.push('/this-does-not-exist');

    expect(router.currentRoute.value.name).toBe('login');
  });

  it('sends an unknown address to the home page when there is a session', async () => {
    useSession().token = 'a-token';

    await router.push('/this-does-not-exist');

    expect(router.currentRoute.value.name).toBe('exchange');
  });

  it('puts the title of the screen in the browser tab', async () => {
    useSession().token = 'a-token';

    await router.push('/historial');

    expect(document.title).toBe('Historial de operaciones · Kambista FX');
  });
});
