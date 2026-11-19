<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { errorMessage } from '../../shared/api/error-messages';
import AppAlert from '../../shared/components/AppAlert.vue';
import AppButton from '../../shared/components/AppButton.vue';
import AppInput from '../../shared/components/AppInput.vue';
import { useSession } from './session.store';
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateName,
  validateNewPassword,
} from './validation';

const session = useSession();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const submitted = ref(false);
const loading = ref(false);
const serverError = ref<string | null>(null);

const errors = computed(() => ({
  name: submitted.value ? validateName(name.value) : null,
  email: submitted.value ? validateEmail(email.value) : null,
  password: submitted.value ? validateNewPassword(password.value) : null,
}));

async function submit() {
  submitted.value = true;
  serverError.value = null;
  if (errors.value.name || errors.value.email || errors.value.password) return;

  loading.value = true;
  try {
    await session.register(
      name.value.trim(),
      email.value.trim(),
      password.value,
    );
  } catch (error) {
    serverError.value = errorMessage(error);
    loading.value = false;
    return;
  }

  // The account exists now: log in so the user does not have to type the same data again.
  try {
    await session.login(email.value.trim(), password.value);
  } catch {
    // The account was created, so send the user to the login instead of showing an error.
    await router.push({ name: 'login', query: { notice: 'registered' } });
    return;
  } finally {
    loading.value = false;
  }
  await router.push({ name: 'exchange' });
}
</script>

<template>
  <h1 class="mb-8 text-2xl font-semibold">Crea tu cuenta</h1>

  <form class="space-y-5" novalidate @submit.prevent="submit">
    <AppAlert v-if="serverError" tone="error">{{ serverError }}</AppAlert>

    <AppInput
      v-model="name"
      label="Nombre"
      autocomplete="name"
      :error="errors.name"
    />
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
      autocomplete="new-password"
      :hint="`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`"
      :error="errors.password"
    />

    <AppButton type="submit" :loading="loading">Crear cuenta</AppButton>
  </form>

  <p class="mt-6 text-center text-sm text-ocean-700">
    ¿Ya tienes cuenta?
    <RouterLink :to="{ name: 'login' }" class="underline hover:text-ink-900"
      >Inicia sesión</RouterLink
    >
  </p>
</template>
