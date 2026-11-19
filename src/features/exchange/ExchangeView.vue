<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { errorMessage } from '../../shared/api/error-messages';
import AppAlert from '../../shared/components/AppAlert.vue';
import AppButton from '../../shared/components/AppButton.vue';
import AppInput from '../../shared/components/AppInput.vue';
import AppSelect from '../../shared/components/AppSelect.vue';
import { createTransaction } from './api';
import { formatDate, formatMoney, formatRate } from './money';
import type { Currency, TransactionResponse } from './types';
import { validateAmount, validateCurrencies } from './validation';

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'PEN', label: 'Soles (PEN)' },
];

const form = reactive({
  amount: '',
  from: 'USD' as Currency,
  to: 'PEN' as Currency,
});
const submitted = ref(false);
const loading = ref(false);
const serverError = ref<string | null>(null);
const result = ref<TransactionResponse | null>(null);

// Errors only appear after the first attempt to submit.
const errors = computed(() => ({
  amount: submitted.value ? validateAmount(form.amount) : null,
  currencies: submitted.value ? validateCurrencies(form.from, form.to) : null,
}));

function swapCurrencies() {
  [form.from, form.to] = [form.to, form.from];
}

async function submit() {
  submitted.value = true;
  serverError.value = null;
  if (errors.value.amount || errors.value.currencies) return;

  loading.value = true;
  try {
    result.value = await createTransaction({
      monedaOrigen: form.from,
      monedaDestino: form.to,
      monto: Number(form.amount.trim()),
    });
  } catch (error) {
    serverError.value = errorMessage(error);
  } finally {
    loading.value = false;
  }
}

function startOver() {
  result.value = null;
  form.amount = '';
  submitted.value = false;
}
</script>

<template>
  <div
    class="mx-auto max-w-lg rounded-2xl border border-mist-200 bg-white p-6 sm:p-8"
  >
    <!-- The exchange was registered: summary -->
    <section v-if="result" aria-live="polite">
      <h2 class="text-2xl font-semibold">Tu cambio fue registrado</h2>
      <dl class="mt-6 divide-y divide-mist-200">
        <div class="flex justify-between py-3">
          <dt class="text-ocean-700">Enviaste</dt>
          <dd class="font-semibold">
            {{ formatMoney(result.monto, result.monedaOrigen) }}
          </dd>
        </div>
        <div class="flex justify-between py-3">
          <dt class="text-ocean-700">Recibes</dt>
          <dd class="text-xl font-bold text-ocean-900">
            {{ formatMoney(result.montoCambiado, result.monedaDestino) }}
          </dd>
        </div>
        <div class="flex justify-between py-3">
          <dt class="text-ocean-700">Tipo de cambio aplicado</dt>
          <dd>{{ formatRate(result.tipoCambio) }}</dd>
        </div>
        <div class="flex justify-between py-3">
          <dt class="text-ocean-700">Fecha</dt>
          <dd>{{ formatDate(result.fecha) }}</dd>
        </div>
      </dl>
      <div class="mt-6">
        <AppButton @click="startOver">Hacer otro cambio</AppButton>
      </div>
    </section>

    <!-- The form -->
    <form v-else novalidate class="space-y-5" @submit.prevent="submit">
      <h2 class="text-2xl font-semibold">Cambia dólares y soles</h2>

      <AppAlert v-if="serverError" tone="error">{{ serverError }}</AppAlert>

      <div class="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <AppInput
          v-model="form.amount"
          label="Monto a cambiar"
          placeholder="0.00"
          inputmode="decimal"
          autocomplete="off"
          :error="errors.amount"
        />
        <AppSelect
          v-model="form.from"
          label="Moneda que envías"
          :options="CURRENCY_OPTIONS"
        />
      </div>

      <div class="flex justify-center">
        <button
          type="button"
          class="grid size-10 place-items-center rounded-full border border-mist-200 text-ocean-700 transition hover:border-mint-500 hover:text-ink-900"
          aria-label="Invertir las monedas"
          @click="swapCurrencies"
        >
          <svg
            viewBox="0 0 24 24"
            class="size-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              d="M8 4v16M8 20l-3-3M8 20l3-3M16 20V4M16 4l-3 3M16 4l3 3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <AppSelect
        v-model="form.to"
        label="Moneda que recibes"
        :options="CURRENCY_OPTIONS"
        :error="errors.currencies"
      />

      <AppButton type="submit" :loading="loading">Realizar cambio</AppButton>
    </form>
  </div>
</template>
