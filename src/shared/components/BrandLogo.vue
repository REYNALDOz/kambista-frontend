<script setup lang="ts">
defineProps<{ tone: 'light' | 'dark' }>();

const LOGOS = {
  dark: '/logo.png',
  light: '/logo2-light.png',
} as const;
</script>

<template>
  <img :src="LOGOS[tone]" alt="Kambista" class="w-auto" />
</template>
