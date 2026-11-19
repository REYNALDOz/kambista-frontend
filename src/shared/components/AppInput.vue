<script setup lang="ts">
import { computed, ref, useId } from 'vue';

const props = defineProps<{
  label: string;
  type?: 'text' | 'email' | 'password' | 'date';
  error?: string | null;
  hint?: string;
  autocomplete?: string;
  placeholder?: string;
  /** Which keyboard a phone shows (`decimal` for amounts). */
  inputmode?: 'text' | 'decimal';
}>();

const model = defineModel<string>({ required: true });

const id = useId();
const isPassword = computed(() => props.type === 'password');
const passwordVisible = ref(false);
const inputType = computed(() =>
  isPassword.value && passwordVisible.value ? 'text' : (props.type ?? 'text'),
);
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm text-ocean-700">{{
      label
    }}</label>
    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :inputmode="inputmode"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="w-full rounded-lg border bg-white px-4 py-3 text-ink-900 outline-none transition focus:ring-2"
        :class="
          error
            ? 'border-danger-600 focus:ring-danger-600/30'
            : 'border-mist-200 focus:border-mint-500 focus:ring-mint-400/30'
        "
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-3 grid place-items-center text-ocean-700 hover:text-ink-900"
        :aria-label="
          passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
        "
        @click="passwordVisible = !passwordVisible"
      >
        <svg
          viewBox="0 0 24 24"
          class="size-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="3" />
          <path v-if="passwordVisible" d="M4 4l16 16" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    <p
      v-if="error"
      :id="`${id}-error`"
      class="mt-1 text-sm text-danger-600"
      role="alert"
    >
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1 text-sm text-ocean-700">{{ hint }}</p>
  </div>
</template>
