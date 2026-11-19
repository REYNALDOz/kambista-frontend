<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import BrandLogo from '../shared/components/BrandLogo.vue';
import UserMenu from './UserMenu.vue';

const route = useRoute();

// The screens of the app. Each new screen adds one line here.
const links = [
  { name: 'exchange', label: 'Inicio' },
  { name: 'history', label: 'Historial de operaciones' },
];
</script>

<template>
  <div class="flex min-h-screen flex-col md:flex-row">
    <!-- Side menu on wide screens, top bar on small ones -->
    <aside
      class="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-mist-200 bg-white px-4 py-3 md:w-64 md:shrink-0 md:flex-col md:flex-nowrap md:items-stretch md:gap-8 md:border-r md:border-b-0 md:px-3 md:py-6"
    >
      <BrandLogo tone="dark" class="h-12 md:ml-3 md:self-start" />
      <nav class="flex gap-1 md:flex-col" aria-label="Principal">
        <RouterLink
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          class="rounded-lg px-3 py-3 text-sm hover:bg-mist-100"
          exact-active-class="bg-mist-100 font-semibold"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex items-center justify-between border-b border-mist-200 px-6 py-4"
      >
        <h1 class="text-xl font-semibold">{{ route.meta.title }}</h1>
        <UserMenu />
      </header>
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
