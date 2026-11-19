import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'exchange',
      component: () => import('../features/exchange/ExchangeView.vue'),
    },
  ],
});
