import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from 'steem-auth-vue';
import { useApiService } from '../composables/useApiService';

export const useMeerayAccountStore = defineStore('meerayAccount', () => {
    const auth = useAuthStore();
    const api = useApiService();

    const account = ref<any>(null);
    const error = ref('');
    const loading = ref(false);

    // Watch for login/logout
    watch(
        () => auth.state.isAuthenticated,
        async (isAuth) => {
            console.log('Watcher triggered. isAuthenticated:', isAuth, 'username:', auth.state.username);
            if (isAuth && auth.state.username) {
                loading.value = true;
                try {
                    account.value = await api.getAccount(auth.state.username);
                    error.value = '';
                } catch (e) {
                    error.value = e instanceof Error ? e.message : String(e);
                    account.value = null;
                } finally {
                    loading.value = false;
                }
            } else {
                account.value = null;
                error.value = '';
            }
        },
        { immediate: true }
    );

    return { account, error, loading };
});