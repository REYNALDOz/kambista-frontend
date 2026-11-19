<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ total: number; pageSize: number }>();
const page = defineModel<number>('page', { required: true });

const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize)),
);
const first = computed(() =>
  props.total === 0 ? 0 : (page.value - 1) * props.pageSize + 1,
);
const last = computed(() => Math.min(page.value * props.pageSize, props.total));

const buttonClass =
  'rounded-lg border border-mist-200 px-3 py-1.5 transition hover:border-mint-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-mist-200';
</script>

<template>
  <nav
    aria-label="Paginación"
    class="flex flex-wrap items-center justify-between gap-3 text-sm"
  >
    <p class="text-ocean-700">
      Mostrando {{ first }}–{{ last }} de {{ total }}
    </p>
    <div class="flex items-center gap-3">
      <button
        type="button"
        :class="buttonClass"
        :disabled="page <= 1"
        @click="page = page - 1"
      >
        Anterior
      </button>
      <span>Página {{ page }} de {{ pageCount }}</span>
      <button
        type="button"
        :class="buttonClass"
        :disabled="page >= pageCount"
        @click="page = page + 1"
      >
        Siguiente
      </button>
    </div>
  </nav>
</template>
