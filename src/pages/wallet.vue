<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiService } from '../composables/useApiService'
import { useTokenUsdPrice } from '../composables/useTokenUsdPrice'
import { useAuthStore } from 'steem-auth-vue'
import { useMeerayAccountStore } from '../stores/meerayAccount'

const api = useApiService()
const auth = useAuthStore()
const meeray = useMeerayAccountStore()
const { usdPrice } = useTokenUsdPrice('USDT')

// State
const tokens = ref<any[]>([])
const nfts = ref<any[]>([])
const portfolio = ref<any>({})
const loading = ref(true)
const activeTab = ref('tokens')
const showDepositModal = ref(false)
const showWithdrawModal = ref(false)

const tabs = [
  { id: 'tokens', name: 'Tokens', icon: '🪙' },
  { id: 'nfts', name: 'NFTs', icon: '🖼️' },
  { id: 'activity', name: 'Activity', icon: '📊' }
]

// Load wallet data
onMounted(async () => {
  if (!auth.state.username) {
    return navigateTo('/marketplace')
  }

  try {
    loading.value = true
    
    const [accountData, nftInstancesData] = await Promise.all([
      api.getAccount(auth.state.username),
      api.getNftInstancesByOwner(auth.state.username)
    ])
    
    tokens.value = accountData.account.balances || []
    nfts.value = nftInstancesData?.data || []
    portfolio.value = accountData
  } catch (err) {
    console.error('Failed to load wallet data:', err)
  } finally {
    loading.value = false
  }
})

// Computed properties
const totalPortfolioValue = computed(() => {
  return tokens.value.reduce((total, token) => {
    const usdPrice = getUsdPrice(token.symbol)
    return total + (parseFloat(token.balance) * usdPrice)
  }, 0)
})

const groupedNFTs = computed(() => {
  const grouped = {}
  nfts.value.forEach(nft => {
    if (!grouped[nft.collection]) {
      grouped[nft.collection] = []
    }
    grouped[nft.collection].push(nft)
  })
  return grouped
})

// Format balance
const formatBalance = (balance: number, decimals = 3) => {
  if (balance >= 1000000) return `${(balance / 1000000).toFixed(1)}M`
  if (balance >= 1000) return `${(balance / 1000).toFixed(1)}K`
  return balance.toFixed(decimals)
}

// Get token icon
const getTokenIcon = (symbol: string) => {
  const icons = {
    'STEEM': '🪙',
    'SBD': '🪙',
    'MEER': '🪙',
    'ECH': '�'
  }
  return icons[symbol] || '🪙'
}
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Redirect if not authenticated -->
      <div v-if="!auth.state.isAuthenticated" class="text-center py-16">
        <div class="nft-panel p-8">
          <h2 class="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p class="text-gray-300 mb-6">Please log in to view your wallet</p>
          <button @click="$router.push('/marketplace')" class="nft-btn">
            Go to Marketplace
          </button>
        </div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p class="text-gray-300">Manage your tokens and NFTs</p>
        </div>

        <!-- Portfolio Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Total Value -->
          <div class="nft-panel">
            <div class="text-sm text-gray-400 mb-2">Total Portfolio Value</div>
            <div class="text-2xl font-bold text-white">${{ totalPortfolioValue.toFixed(2) }}</div>
          </div>

          <!-- Token Count -->
          <div class="nft-panel">
            <div class="text-sm text-gray-400 mb-2">Token Types</div>
            <div class="text-2xl font-bold text-cyan-400">{{ tokens.length }}</div>
          </div>

          <!-- NFT Count -->
          <div class="nft-panel">
            <div class="text-sm text-gray-400 mb-2">Owned NFTs</div>
            <div class="text-2xl font-bold text-purple-400">{{ nfts.length }}</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-4 mb-8">
          <button @click="showDepositModal = true" class="nft-btn">
            💰 Deposit
          </button>
          <button @click="showWithdrawModal = true" class="nft-btn bg-purple-600">
            💸 Withdraw
          </button>
          <button @click="$router.push('/create')" class="nft-btn bg-green-600">
            ✨ Create NFT
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-1 mb-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all',
              activeTab === tab.id
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            ]"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.name }}</span>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="steem-auth-spinner"></div>
        </div>

        <!-- Tokens Tab -->
        <div v-else-if="activeTab === 'tokens'">
          <div class="nft-panel">
            <h3 class="text-xl font-bold text-white mb-6">Token Balances</h3>
            
            <div v-if="tokens.length" class="space-y-4">
              <div 
                v-for="token in tokens" 
                :key="token.symbol"
                class="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div class="text-2xl">{{ getTokenIcon(token.symbol) }}</div>
                  <div>
                    <div class="font-semibold text-white">{{ token.symbol }}</div>
                    <div class="text-sm text-gray-400">{{ token.name || token.symbol }}</div>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="font-bold text-white">{{ formatBalance(parseFloat(token.balance)) }}</div>
                  <div class="text-sm text-gray-400">
                    ${{ (parseFloat(token.balance) * getUsdPrice(token.symbol)).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-400">
              No tokens found in your wallet
            </div>
          </div>
        </div>

        <!-- NFTs Tab -->
        <div v-else-if="activeTab === 'nfts'">
          <div v-if="Object.keys(groupedNFTs).length" class="space-y-8">
            <div v-for="(collectionNFTs, collection) in groupedNFTs" :key="collection">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>{{ collection }}</span>
                <span class="text-sm text-gray-400">({{ collectionNFTs.length }})</span>
              </h3>
              
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div 
                  v-for="nft in collectionNFTs" 
                  :key="nft.id"
                  class="nft-panel p-0 overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer"
                  @click="$router.push(`/nft/${collection}/${nft.id}`)"
                >
                  <div class="aspect-square">
                    <img 
                      :src="nft.image || '/images/nfts/01.png'" 
                      :alt="nft.name"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div class="p-3">
                    <div class="font-medium text-white text-sm mb-1">{{ nft.name }}</div>
                    <div class="text-xs text-gray-400">#{{ nft.id }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-16">
            <div class="nft-panel p-8">
              <div class="text-6xl mb-4">🖼️</div>
              <h3 class="text-xl font-bold text-white mb-2">No NFTs Found</h3>
              <p class="text-gray-400 mb-6">You don't own any NFTs yet</p>
              <button @click="$router.push('/marketplace')" class="nft-btn">
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>

        <!-- Activity Tab -->
        <div v-else-if="activeTab === 'activity'">
          <div class="nft-panel">
            <h3 class="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div class="text-center py-8 text-gray-400">
              Activity history coming soon...
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Deposit Modal -->
    <div v-if="showDepositModal" class="steem-auth-modal-overlay" @click="showDepositModal = false">
      <div class="steem-auth-modal-content" @click.stop>
        <div class="steem-auth-modal-header">
          <h2>Deposit Tokens</h2>
          <button @click="showDepositModal = false" class="steem-auth-close-button">&times;</button>
        </div>
        <div class="steem-auth-modal-body">
          <div class="text-center">
            <p class="text-gray-300 mb-4">Deposit functionality coming soon...</p>
            <p class="text-sm text-gray-400">You can currently deposit tokens through the Steem blockchain directly.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div v-if="showWithdrawModal" class="steem-auth-modal-overlay" @click="showWithdrawModal = false">
      <div class="steem-auth-modal-content" @click.stop>
        <div class="steem-auth-modal-header">
          <h2>Withdraw Tokens</h2>
          <button @click="showWithdrawModal = false" class="steem-auth-close-button">&times;</button>
        </div>
        <div class="steem-auth-modal-body">
          <div class="text-center">
            <p class="text-gray-300 mb-4">Withdraw functionality coming soon...</p>
            <p class="text-sm text-gray-400">You can currently withdraw tokens through the Steem blockchain directly.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
