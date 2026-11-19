import { createRouter, createWebHistory } from 'vue-router';
import { useSession } from '../features/auth/session.store';
import { redirectFor } from './guard';

declare module 'vue-router' {
  interface RouteMeta {
    /** Reachable without a session (login and register). */
    public?: boolean;
    /** Title shown in the top bar of the app. */
    title?: string;
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Screens of the app: they need a session and use the side menu layout.
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'exchange',
          component: () => import('../features/exchange/ExchangeView.vue'),
          meta: { title: 'Inicio' },
        },
        {
          path: 'historial',
          name: 'history',
          component: () => import('../features/history/HistoryView.vue'),
          meta: { title: 'Historial de operaciones' },
        },
      ],
    },
    // Login and register: public, with the split screen layout.
    // (Both groups start at "/", but their children have different paths.)
    {
      path: '/',
      component: () => import('../layouts/AuthLayout.vue'),
      meta: { public: true },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../features/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../features/auth/RegisterView.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to) => redirectFor(to, useSession().isAuthenticated));
