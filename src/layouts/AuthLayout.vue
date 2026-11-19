<script setup lang="ts">
import { RouterView } from 'vue-router';
import BrandLogo from '../shared/components/BrandLogo.vue';

// What the app does, in three steps (shown next to the login and register forms).
const steps = [
  {
    title: 'Cotiza tu operación',
    text: 'Calcula cuánto recibes con el último tipo de cambio de SUNAT.',
  },
  {
    title: 'Registra tu cambio',
    text: 'Indica el monto y las monedas, y confirma tu solicitud.',
  },
  {
    title: 'Consulta tu historial',
    text: 'Revisa todas tus operaciones y filtra por fechas.',
  },
];
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Brand panel: only on wide screens -->
    <aside
      class="hidden flex-col justify-between bg-linear-to-b from-indigo-800 to-ink-900 p-16 text-white lg:flex"
    >
      <BrandLogo tone="light" class="mt-20 h-20" />
      <ol class="space-y-8">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="flex items-start gap-4"
        >
          <span
            class="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-lg font-semibold text-mint-400"
          >
            {{ index + 1 }}
          </span>
          <div>
            <h2 class="text-lg font-semibold">{{ step.title }}</h2>
            <p class="text-white/80">{{ step.text }}</p>
          </div>
        </li>
      </ol>
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
