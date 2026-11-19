import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';

/**
 * Decides where a navigation goes, depending on whether there is a session.
 * Returns `true` to let it through.
 */
export function redirectFor(
  to: Pick<RouteLocationNormalized, 'meta' | 'fullPath'>,
  isAuthenticated: boolean,
): RouteLocationRaw | true {
  if (!to.meta.public && !isAuthenticated) {
    // Remember where the user was going, to bring them back after logging in.
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.public && isAuthenticated) {
    return { name: 'exchange' };
  }
  return true;
}

/**
 * The `redirect` of the URL can be anything, so only paths inside this app are accepted.
 * Otherwise a link could send the user to another site right after logging in.
 */
export function safeRedirect(value: unknown): string {
  const isInternalPath =
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\');
  return isInternalPath ? value : '/';
}
