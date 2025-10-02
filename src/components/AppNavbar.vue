<script setup lang="ts">
import { ref } from 'vue';
import { SteemAuth, useAuthStore } from 'steem-auth-vue';
import { useTransactionService } from '../composables/useTransactionService';

import { useRoute, useRouter } from 'vue-router';
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const isDarkTheme = ref(false);
const toggleTheme = () => { isDarkTheme.value = !isDarkTheme.value; handleThemeChange(isDarkTheme.value); };
const THEME_STORAGE_KEY = 'steem-auth-theme';

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
}

function isActive(item: any) {
  // For exact match or startsWith for subroutes
  if (!item.href) return false;
  const path = item.href.startsWith('/') ? item.href : '/' + item.href;
  return route.path === path || route.path.startsWith(path + '/');
}

const handleThemeChange = (isDark: boolean): void => {
  console.log('Theme changed:', isDark ? 'dark' : 'light');
  isDarkTheme.value = isDark;
  applyTheme(isDark);
};

const applyTheme = (isDark: boolean) => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }
};

const initTheme = () => {
  if (typeof window === 'undefined') return;
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme) {
    isDarkTheme.value = storedTheme === 'dark';
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Use system preference if no stored theme
    isDarkTheme.value = true;
  }

  applyTheme(isDarkTheme.value);

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        isDarkTheme.value = e.matches;
        applyTheme(isDarkTheme.value);
      }
    });
  }
};

function handleModalOpen() {
  document.body.classList.add('steem-auth-modal-open');
  setTimeout(() => {
    const row = document.querySelector('.steem-auth-accounts-row') as (Element & { _wheelHandler?: (e: WheelEvent) => void, scrollLeft?: number });
    if (row && !row._wheelHandler) {
      row._wheelHandler = function (e: WheelEvent) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          if (typeof row.scrollLeft === 'number') {
            row.scrollLeft += e.deltaY;
          }
        }
      };
      row.addEventListener('wheel', row._wheelHandler, { passive: false });
    }
  }, 0);
}

function handleModalClose() {
  document.body.classList.remove('steem-auth-modal-open');
  const row = document.querySelector('.steem-auth-accounts-row') as (Element & { _wheelHandler?: (e: WheelEvent) => void });
  if (row && row._wheelHandler) {
    row.removeEventListener('wheel', row._wheelHandler);
    delete row._wheelHandler;
  }
}

onMounted(() => {
  initTheme();

});

const txService = useTransactionService();
const isKafkaConnected = txService.isConnected;

</script>

<template>
  <header class="border-b border-gray-800 py-4">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-10">
          <router-link to="/" class="flex items-center">
            <div
              class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 class="ml-2 text-xl font-bold text-white">MeeRayNFT</h1>
          </router-link>

          <nav class="hidden md:flex space-x-8">
            <router-link to="/marketplace" :class="['px-3 py-2 text-sm font-medium transition-colors',
              route.path === '/marketplace'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white']">
              Explore
            </router-link>
            <router-link to="/collections" :class="['px-3 py-2 text-sm font-medium transition-colors',
              route.path === '/collections'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white']">
              Collections
            </router-link>
            <router-link to="/rankings" :class="['px-3 py-2 text-sm font-medium transition-colors',
              route.path === '/rankings'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white']">
              Rankings
            </router-link>
            <router-link to="/activity" :class="['px-3 py-2 text-sm font-medium transition-colors',
              route.path === '/activity'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white']">
              Activity
            </router-link>
            <router-link to="/create" :class="['px-3 py-2 text-sm font-medium transition-colors',
              route.path === '/create'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white']">
              Create
            </router-link>
          </nav>
        </div>

        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <input v-model="searchQuery" type="text" placeholder="Search items, collections, and accounts"
              class="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900/80 text-white border border-gray-700 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              @keyup.enter="handleSearch">
            <div class="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center mr-2" title="Kafka connection status">
            <span
              :class="['inline-block w-3 h-3 rounded-full mr-2', isKafkaConnected ? 'bg-green-500' : 'bg-red-500']"></span>
            <span class="text-sm text-gray-500 dark:text-gray-300">Kafka</span>
          </div>
          <button class="steem-auth-theme-toggle" @click="toggleTheme" type="button">
            {{ isDarkTheme ? '☀️' : '🌙' }}
          </button>
          <SteemAuth  appName="future.app" 
            callbackURL="https://nft.meeray.com" steemApi="https://testapi.moecki.online"
            :steemApiOptions="{ addressPrefix: 'MTN', chainId: '1aa939649afcc54c67e01a809967f75b8bee5d928aa6bdf237d0d5d6bfbc5c22' }" />
          <router-link :to="`/profile/${auth.state.username}`" class="relative" v-if="auth.state.isAuthenticated">
            <img :src="`https://steemit.com/avatar/${auth.state.username}`" alt="Profile"
              class="w-10 h-10 rounded-full border-2 border-purple-600" />
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-gray-900">
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </header>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

nav {
  font-family: 'Inter', 'Satoshi', 'Montserrat', 'Segoe UI', Arial, sans-serif;
}
</style>