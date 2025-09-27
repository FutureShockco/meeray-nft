import { ref, computed } from 'vue';
import { useCoinPricesStore } from '../stores/useCoinPrices';
/**
 * Returns a computed ref with the USD price of a token using its pools with STEEM, SBD, USDT, USDC, BTC, ETH, BNB, or defaults to 1 USD.
 * @param symbol The token symbol (string)
 */
export function useTokenUsdPrice(symbol: string) {
  const coinPrices = useCoinPricesStore();
  const usdPrice = ref<number>(0);
  const loading = ref(false);
  const error = ref('');

  // Order of reference tokens to try
  const referenceTokens = ['STEEM', 'SBD', 'USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'TESTS', 'TBD'];

  async function fetchPrice() {
    loading.value = true;
    error.value = '';
    usdPrice.value = 0;
    try {
      // If symbol is a reference token, use CoinGecko price directly
      if (referenceTokens.includes(symbol)) {
        const refUsd = coinPrices.prices[symbol];
        if (refUsd) {
          usdPrice.value = refUsd;
        } else {
          error.value = `No USD price for ${symbol}`;
          usdPrice.value = 0;
        }
        loading.value = false;
        return;
      }

    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch price';
    } finally {
      loading.value = false;
    }
  }

  // Optionally, auto-fetch on composable use
  fetchPrice();

  // Expose a computed ref for reactivity
  const price = computed(() => usdPrice.value);

  return price;
} 