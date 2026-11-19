<script setup lang="ts">
// The logo file has dark text, so it only reads well on light backgrounds.
// On dark ones (`tone="light"`) it is turned white. The caller sets the height (`class="h-12"`).
defineProps<{ tone: 'light' | 'dark' }>();
</script>

<template>
  <img
    src="/logo.png"
    alt="Kambista"
    class="w-auto"
    :class="{ 'brightness-0 invert': tone === 'light' }"
  />
</template>
