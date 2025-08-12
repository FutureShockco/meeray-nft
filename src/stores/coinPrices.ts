import { defineStore } from 'pinia';

interface State {
  prices: Record<string, number>;
  changes: Record<string, number | null>;
  marketCaps: Record<string, number | null>;
  loading: boolean;
  error: string | null;
}

// Map your symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  STEEM: 'steem',
  SBD: 'steem-dollars',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  USDC: 'usd-coin',
};
const FIAT = 'usd';

export const useCoinPricesStore = defineStore('coinPrices', {
  state: (): State => ({
    prices: {},
    changes: {},
    marketCaps: {},
    loading: false,
    error: null,
  }),
  actions: {
    async fetchPrices() {
      this.loading = true;
      this.error = null;
      try {
        const ids = Object.values(COINGECKO_IDS).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${FIAT}&include_24hr_change=true&include_market_cap=true`;
        const res = await fetch(url);
        const data = await res.json();
        // data is like { steem: { usd: 0.15, usd_24h_change: -2.34, usd_market_cap: 123456 }, ... }
        this.prices = {};
        this.changes = {};
        this.marketCaps = {};
        for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
          this.prices[symbol] = data[id]?.[FIAT] ?? null;
          this.changes[symbol] = data[id]?.[`${FIAT}_24h_change`] ?? null;
          this.marketCaps[symbol] = data[id]?.[`${FIAT}_market_cap`] ?? null;
        }
      } catch (e: any) {
        this.error = e.message || 'Unknown error';
      } finally {
        this.loading = false;
      }
    },
  },
}); 