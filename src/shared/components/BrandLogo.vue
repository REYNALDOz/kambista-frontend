<script setup lang="ts">
// `tone` is the color of the logo: "dark" (dark text) goes on light backgrounds and
// "light" (white text) on dark ones, like the login panel. The caller sets the height (`class="h-12"`).
defineProps<{ tone: 'light' | 'dark' }>();

const LOGOS = {
  dark: '/logo.png',
  light: '/logo2-light.png',
} as const;
</script>

<template>
  <img :src="LOGOS[tone]" alt="Kambista" class="w-auto" />
</template>
