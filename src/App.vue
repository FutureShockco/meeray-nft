<script setup lang="ts">

</script>

<template>
  <div class="min-h-screen nft-container ">
    <AppNavbar>
      <template #logo>
        <span class="font-extrabold text-2xl tracking-tight text-primary-400">EchelonDex</span>
      </template>
    </AppNavbar>
    <router-view class="container mx-auto"/>
    <footer class="bg-gray-100 border-t mt-auto">
      <div class="container mx-auto text-center text-gray-600">
        <p>&copy; {{ new Date().getFullYear() }} MeeRayNFT</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>

html, body {
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
