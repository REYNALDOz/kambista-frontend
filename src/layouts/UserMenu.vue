<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSession } from '../features/auth/session.store';

const session = useSession();
const router = useRouter();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const initial = computed(
  () => session.user?.nombre.charAt(0).toUpperCase() ?? '?',
);

function closeOnOutsideClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node))
    open.value = false;
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false;
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
  document.addEventListener('keydown', closeOnEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
  document.removeEventListener('keydown', closeOnEscape);
});

async function logout() {
  open.value = false;
  session.logout();
  await router.push({ name: 'login' });
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-mist-100"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span
        class="grid size-9 place-items-center rounded-full bg-ocean-900 text-sm font-semibold text-white"
      >
        {{ initial }}
      </span>
      <span
        class="hidden text-sm font-semibold tracking-wide uppercase sm:block"
      >
        {{ session.user?.nombre }}
      </span>
      <svg
        viewBox="0 0 24 24"
        class="size-4 transition"
        :class="{ 'rotate-180': open }"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div
      v-if="open"
      role="menu"
      class="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-mist-200 bg-white p-2 shadow-lg"
    >
      <div class="border-b border-mist-200 px-3 py-2">
        <p class="font-semibold">{{ session.user?.nombre }}</p>
        <p class="truncate text-sm text-ocean-700">{{ session.user?.email }}</p>
      </div>
      <button
        type="button"
        role="menuitem"
        class="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-mist-100"
        @click="logout"
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
            d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Cerrar sesión
      </button>
    </div>
  </div>
</template>
