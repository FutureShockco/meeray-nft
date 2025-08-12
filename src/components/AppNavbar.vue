<script setup lang="ts">

import { ref, computed } from 'vue';
import { SteemAuth, SteemTransactions, MeerayTransactions, useAuthStore } from 'steem-auth-vue';
import { useRoute, useRouter } from 'vue-router';
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');


function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
}


const isDarkTheme = ref(false);
const handleThemeChange = (isDark: boolean): void => {
  console.log('Theme changed:', isDark ? 'dark' : 'light');
  isDarkTheme.value = isDark;
};
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
          <SteemAuth @theme-change="handleThemeChange" appName="future.app" displayDarkModeToggle
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