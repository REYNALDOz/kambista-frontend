<script setup lang="ts" generic="T extends string">
import { useId } from 'vue';

defineProps<{
  label: string;
  options: { value: T; label: string }[];
  error?: string | null;
}>();

const model = defineModel<T>({ required: true });
const id = useId();
</script>

<template>
  <div>
    <label :for="id" class="mb-1 block text-sm text-ocean-700">{{
      label
    }}</label>
    <select
      :id="id"
      v-model="model"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="w-full rounded-lg border bg-white px-4 py-3 text-ink-900 outline-none transition focus:ring-2"
      :class="
        error
          ? 'border-danger-600 focus:ring-danger-600/30'
          : 'border-mist-200 focus:border-mint-500 focus:ring-mint-400/30'
      "
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <p
      v-if="error"
      :id="`${id}-error`"
      class="mt-1 text-sm text-danger-600"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
