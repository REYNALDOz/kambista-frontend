import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as authApi from './api';
import type { User } from './api';

const STORAGE_KEY = 'kambista.session';

interface StoredSession {
  token: string;
  user: User;
}

// The browser storage can be blocked or empty (private windows), so it never breaks the app.
function readStored(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeStored(session: StoredSession | null): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The session still works in memory until the page is reloaded.
  }
}

export const useSession = defineStore('session', () => {
  const stored = readStored();
  const token = ref<string | null>(stored?.token ?? null);
  const user = ref<User | null>(stored?.user ?? null);

  const isAuthenticated = computed(() => token.value !== null);

  async function login(email: string, password: string): Promise<void> {
    const result = await authApi.login(email, password);
    token.value = result.access_token;
    user.value = result.usuario;
    writeStored({ token: result.access_token, user: result.usuario });
  }

  async function register(
    nombre: string,
    email: string,
    password: string,
  ): Promise<void> {
    await authApi.register(nombre, email, password);
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    writeStored(null);
  }

  return { token, user, isAuthenticated, login, register, logout };
});
