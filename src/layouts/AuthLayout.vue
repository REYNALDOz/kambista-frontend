<script setup lang="ts">
import { RouterView } from 'vue-router';
import BrandLogo from '../shared/components/BrandLogo.vue';
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <aside
      className="hidden flex-col justify-center bg-linear-to-b from-indigo-800 to-ink-900 p-16 text-white lg:flex"
    >
      <div className="flex items-center justify-center">
        <BrandLogo tone="light" />
      </div>
    </aside>

    <main
      class="flex flex-col items-center justify-center gap-10 bg-mist-100 p-6"
    >
      <BrandLogo tone="dark" class="h-16 lg:hidden" />
      <div class="w-full max-w-sm">
        <RouterView />
      </div>
    </main>
  </div>
</template>
