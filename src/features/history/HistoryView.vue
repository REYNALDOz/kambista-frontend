<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { errorMessage } from '../../shared/api/error-messages';
import AppAlert from '../../shared/components/AppAlert.vue';
import AppButton from '../../shared/components/AppButton.vue';
import AppInput from '../../shared/components/AppInput.vue';
import PaginationBar from '../../shared/components/PaginationBar.vue';
import { formatDate, formatMoney, formatRate } from '../exchange/money';
import type { TransactionResponse } from '../exchange/types';
import { useSession } from '../auth/session.store';
import { getHistory, type HistoryFilters } from './api';
import { defaultRange, toInstants, validateRange } from './range';

const PAGE_SIZE = 10;

const range = reactive(defaultRange());
const submitted = ref(false);
const loading = ref(true);
const loaded = ref(false);
const loadError = ref<string | null>(null);
const transactions = ref<TransactionResponse[]>([]);
const page = ref(1);
const total = ref(0);

// An admin can look at the history of another user. Everybody else always sees their own,
// and the API ignores a userId that does not come from an admin.
const session = useSession();
const isAdmin = computed(() => session.user?.rol === 'admin');
const userId = ref('');

// What the last search asked for. Moving between pages uses this, not the inputs, which the
// user may have edited without pressing "Buscar".
let searched: HistoryFilters = toInstants(range);

const errors = computed(() =>
  submitted.value ? validateRange(range) : { startDate: null, endDate: null },
);

let latestSearch = 0;

function search() {
  submitted.value = true;
  const problems = validateRange(range);
  if (problems.startDate || problems.endDate) return;
  const wantedUser = userId.value.trim();
  searched = {
    ...toInstants(range),
    ...(isAdmin.value && wantedUser ? { userId: wantedUser } : {}),
  };
  void load(1);
}

async function load(target: number) {
  const thisSearch = ++latestSearch;
  loading.value = true;
  loadError.value = null;
  try {
    const result = await getHistory(searched, target, PAGE_SIZE);
    if (thisSearch !== latestSearch) return;
    transactions.value = result.items;
    total.value = result.total;
    page.value = target;
    loaded.value = true;
  } catch (error) {
    if (thisSearch !== latestSearch) return;
    transactions.value = [];
    total.value = 0;
    loadError.value = errorMessage(error);
  } finally {
    if (thisSearch === latestSearch) loading.value = false;
  }
}

onMounted(search); // starts with the last 30 days
</script>

<template>
  <div class="space-y-6">
    <form
      novalidate
      class="grid items-start gap-4 rounded-2xl border border-mist-200 bg-white p-6 sm:grid-cols-[1fr_1fr_auto]"
      @submit.prevent="search"
    >
      <AppInput
        v-if="isAdmin"
        v-model="userId"
        class="sm:col-span-3"
        label="ID de usuario"
        placeholder="Pega aquí el ID del usuario"
        hint="Déjalo vacío para ver tu propio historial."
        autocomplete="off"
      />
      <AppInput
        v-model="range.startDate"
        label="Desde"
        type="date"
        :error="errors.startDate"
      />
      <AppInput
        v-model="range.endDate"
        label="Hasta"
        type="date"
        :error="errors.endDate"
      />
      <div class="sm:mt-6">
        <AppButton type="submit" :loading="loading">Buscar</AppButton>
      </div>
    </form>

    <AppAlert v-if="loadError" tone="error">
      <span>{{ loadError }}</span>
      <button
        type="button"
        class="ml-3 font-semibold underline"
        @click="search"
      >
        Reintentar
      </button>
    </AppAlert>

    <div
      v-if="loading && !loaded"
      class="py-12 text-center text-ocean-700"
      role="status"
    >
      Cargando operaciones…
    </div>

    <p
      v-else-if="loaded && !loadError && transactions.length === 0"
      class="rounded-2xl border border-mist-200 bg-white p-10 text-center text-ocean-700"
    >
      No hay operaciones en este rango de fechas.
    </p>

    <section
      v-else-if="transactions.length > 0"
      class="space-y-4 rounded-2xl border border-mist-200 bg-white p-6"
      :class="{ 'opacity-60': loading }"
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[32rem] text-left text-sm">
          <thead class="border-b border-mist-200 text-ocean-700">
            <tr>
              <th scope="col" class="py-3 pr-4 font-semibold">Fecha</th>
              <th scope="col" class="py-3 pr-4 font-semibold">Enviaste</th>
              <th scope="col" class="py-3 pr-4 font-semibold">Recibiste</th>
              <th scope="col" class="py-3 text-right font-semibold">
                Tipo de cambio
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-mist-200">
            <tr v-for="item in transactions" :key="item.id">
              <td class="py-3 pr-4">{{ formatDate(item.fecha) }}</td>
              <td class="py-3 pr-4">
                {{ formatMoney(item.monto, item.monedaOrigen) }}
              </td>
              <td class="py-3 pr-4 font-semibold">
                {{ formatMoney(item.montoCambiado, item.monedaDestino) }}
              </td>
              <td class="py-3 text-right">{{ formatRate(item.tipoCambio) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :page="page"
        :total="total"
        :page-size="PAGE_SIZE"
        @update:page="(target) => load(target)"
      />
    </section>
  </div>
</template>
