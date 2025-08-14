import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useApiService } from '../composables/useApiService';

export const useTokenListStore = defineStore('tokenList', () => {
  const tokens = ref<any[]>([]);
  const newTokens = ref<any[]>([]); // For new tokens that may be added later
  const loading = ref(false);
  const error = ref('');

  const api = useApiService();

  async function fetchTokens() {
    loading.value = true;
    error.value = '';
    try {
      const res = await api.getTokens();
      tokens.value = Array.isArray(res.data) ? res.data : [];
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch tokens';
    } finally {
      loading.value = false;
    }

  }

  function getTokenPrecision(symbol: string): number {
    const token = tokens.value.find((t: any) => t.symbol === symbol);
    return token?.precision ?? 8;
  }

  return { tokens, newTokens, loading, error, fetchTokens, getTokenPrecision };
});