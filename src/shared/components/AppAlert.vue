<script setup lang="ts">
defineProps<{ tone: 'error' | 'info' }>();
</script>

<template>
  <p
    class="rounded-lg border px-4 py-3 text-sm"
    :class="
      tone === 'error'
        ? 'border-danger-600/30 bg-danger-600/10 text-danger-600'
        : 'border-mint-500/40 bg-mint-400/10 text-ocean-900'
    "
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <slot />
  </p>
</template>
