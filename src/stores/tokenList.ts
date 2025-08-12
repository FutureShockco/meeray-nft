import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useApiService } from '../composables/useApiService';

export const useTokenListStore = defineStore('tokenList', () => {
  const tokens = ref<any[]>([]);
  const loading = ref(false);
  const error = ref('');

  const api = useApiService();

  async function fetchTokens() {
    loading.value = true;
    error.value = '';
    try {
      const res = await api.getTokenList();
      tokens.value = Array.isArray(res.tokens) ? res.tokens : [];
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch tokens';
    } finally {
      loading.value = false;
    }
  }

  return { tokens, loading, error, fetchTokens };
}); 