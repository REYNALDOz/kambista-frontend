import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import AppLayout from './AppLayout.vue';

const Screen = { template: '<div />' };

async function mountAt(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: AppLayout,
        children: [
          {
            path: '',
            name: 'exchange',
            component: Screen,
            meta: { title: 'Inicio' },
          },
          {
            path: 'historial',
            name: 'history',
            component: Screen,
            meta: { title: 'Historial de operaciones' },
          },
        ],
      },
    ],
  });
  await router.push(path);
  await router.isReady();
  return mount(AppLayout, { global: { plugins: [createPinia(), router] } });
}

describe('AppLayout menu', () => {
  it('highlights only the screen the user is on: history', async () => {
    const [home, history] = (await mountAt('/historial')).findAll('nav a');

    expect(history.classes()).toContain('font-semibold');
    expect(home.classes()).not.toContain('font-semibold');
  });

  it('highlights only the screen the user is on: home', async () => {
    const [home, history] = (await mountAt('/')).findAll('nav a');

    expect(home.classes()).toContain('font-semibold');
    expect(history.classes()).not.toContain('font-semibold');
  });
});
