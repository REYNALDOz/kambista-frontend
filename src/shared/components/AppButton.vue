<script setup lang="ts">
defineProps<{ loading?: boolean; type?: 'button' | 'submit' }>();
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="loading"
    class="flex w-full items-center justify-center gap-2 rounded-lg bg-mint-400 px-4 py-3 text-sm font-semibold tracking-wide text-ink-900 uppercase transition hover:bg-mint-500 disabled:cursor-not-allowed disabled:opacity-60"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-ink-900 border-t-transparent"
      aria-hidden="true"
    ></span>
    <slot />
  </button>
</template>
