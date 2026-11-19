<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { safeRedirect } from '../../router/guard';
import { errorMessage } from '../../shared/api/error-messages';
import AppAlert from '../../shared/components/AppAlert.vue';
import AppButton from '../../shared/components/AppButton.vue';
import AppInput from '../../shared/components/AppInput.vue';
import { useSession } from './session.store';
import { validateEmail, validateLoginPassword } from './validation';

const session = useSession();
const router = useRouter();
const route = useRoute();

// Messages for the reasons the user can arrive here (`/login?notice=...`).
const NOTICES: Record<string, string> = {
  expired: 'Tu sesión expiró. Inicia sesión de nuevo.',
  registered: 'Tu cuenta fue creada. Inicia sesión para continuar.',
};
const notice = computed(() => NOTICES[String(route.query.notice)]);

const email = ref('');
const password = ref('');
const submitted = ref(false);
const loading = ref(false);
const serverError = ref<string | null>(null);

// Field errors only appear after the first attempt to submit.
const errors = computed(() => ({
  email: submitted.value ? validateEmail(email.value) : null,
  password: submitted.value ? validateLoginPassword(password.value) : null,
}));

async function submit() {
  submitted.value = true;
  serverError.value = null;
  if (errors.value.email || errors.value.password) return;

  loading.value = true;
  try {
    await session.login(email.value.trim(), password.value);
  } catch (error) {
    serverError.value = errorMessage(error);
    return;
  } finally {
    loading.value = false;
  }
  // Outside the try: a navigation problem must not look like a wrong password.
  await router.push(safeRedirect(route.query.redirect));
}
</script>

<template>
  <h1 class="mb-8 text-2xl font-semibold">Inicia sesión</h1>

  <form class="space-y-5" novalidate @submit.prevent="submit">
    <AppAlert v-if="notice" tone="info">{{ notice }}</AppAlert>
    <AppAlert v-if="serverError" tone="error">{{ serverError }}</AppAlert>

    <AppInput
      v-model="email"
      label="Correo"
      type="email"
      autocomplete="email"
      :error="errors.email"
    />
    <AppInput
      v-model="password"
      label="Contraseña"
      type="password"
      autocomplete="current-password"
      :error="errors.password"
    />

    <AppButton type="submit" :loading="loading">Iniciar sesión</AppButton>
  </form>

  <p class="mt-6 text-center text-sm text-ocean-700">
    ¿No tienes cuenta?
    <RouterLink :to="{ name: 'register' }" class="underline hover:text-ink-900"
      >Regístrate aquí</RouterLink
    >
  </p>
</template>
