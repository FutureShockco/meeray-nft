<script setup lang="ts">
import { useAuthStore } from 'steem-auth-vue';

const auth = useAuthStore();

// Redirect based on authentication status
onMounted(() => {
  const router = useRouter();
  if (auth.state.isAuthenticated && auth.state.username) {
    // Redirect to user's profile
    router.push(`/profile/${auth.state.username}`);
  } else {
    // Redirect to marketplace if not authenticated
    router.push('/marketplace');
  }

});
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="steem-auth-spinner mb-4"></div>
        <p class="text-gray-300">Redirecting...</p>
      </div>
    </div>
  </div>
</template>
