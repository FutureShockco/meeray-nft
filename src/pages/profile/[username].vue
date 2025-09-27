<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiService } from '../../composables/useApiService'
import { useTransactionService } from '../../composables/useTransactionService'
import { useAuthStore } from 'steem-auth-vue'

const route = useRoute()
const router = useRouter()
const api = useApiService()
const txService = useTransactionService()
const auth = useAuthStore()

// Route params using bracket notation (Nuxt 3 format)
const username = route.params.username as string

// State
const user = ref<any>(null)
const userNFTs = ref<any[]>([])
const userCollections = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const activeTab = ref('collected')
const showTransferModal = ref(false)
const showFollowModal = ref(false)

const tabs = [
  { id: 'collected', name: 'Collected', icon: '🖼️' },
  { id: 'created', name: 'Created', icon: '✨' },
  { id: 'collections', name: 'Collections', icon: '📚' },
  { id: 'activity', name: 'Activity', icon: '📊' }
]

// Load profile data
onMounted(async () => {
  try {
    loading.value = true
    
    const [accountData, nftInstancesData, collectionsData] = await Promise.all([
      api.getAccount(username),
      api.getNftInstancesByOwner(username),
      api.getNftCollections({ creator: username })
    ])
    
    user.value = {
      username,
      ...accountData.account,
      stats: {
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500),
        created: collectionsData?.data?.length || 0,
        collected: nftInstancesData?.data?.length || 0,
        likes: Math.floor(Math.random() * 2000)
      },
      bio: `NFT collector and creator on the Steem blockchain.`,
      joinedDate: accountData.account?.created || '2023-01-01'
    }
    
    userNFTs.value = nftInstancesData?.data || []
    userCollections.value = collectionsData?.data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load profile'
  } finally {
    loading.value = false
  }
})

// Computed properties
const isOwnProfile = computed(() => auth.state.username === username)
const collectedNFTs = computed(() => userNFTs.value.filter(nft => nft.owner === username))
const createdNFTs = computed(() => userNFTs.value.filter(nft => nft.creator === username))

// Group NFTs by collection
const groupedCollectedNFTs = computed(() => {
  const grouped: Record<string, any[]> = {}
  collectedNFTs.value.forEach(nft => {
    if (!grouped[nft.collectionSymbol]) {
      grouped[nft.collectionSymbol] = []
    }
    grouped[nft.collectionSymbol].push(nft)
  })
  return grouped
})

const groupedCreatedNFTs = computed(() => {
  const grouped: Record<string, any[]> = {}
  createdNFTs.value.forEach(nft => {
    if (!grouped[nft.collectionSymbol]) {
      grouped[nft.collectionSymbol] = []
    }
    grouped[nft.collectionSymbol].push(nft)
  })
  return grouped
})

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

// Follow/Unfollow actions
const followUser = async () => {
  // TODO: Implement actual follow functionality with API
  console.log('Following user:', username)
  showFollowModal.value = false
}
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-6xl mx-auto px-4 py-8">
      
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="steem-auth-spinner"></div>
      </div>

      
      <div v-else-if="error" class="text-center py-16">
        <div class="nft-panel p-8">
          <h2 class="text-2xl font-bold text-red-400 mb-4">Profile Not Found</h2>
          <p class="text-gray-300 mb-6">{{ error }}</p>
          <button @click="router.push('/marketplace')" class="nft-btn">
            Back to Marketplace
          </button>
        </div>
      </div>

      
      <div v-else-if="user">
        
        <div class="nft-panel mb-8">
          
          <div class="h-48 -m-6 mb-0 rounded-t-lg bg-gradient-to-r from-cyan-500 to-purple-600 relative">
            <div class="absolute inset-0 bg-black/20"></div>
          </div>
          
          
          <div class="relative px-6 pb-6">
            
            <div class="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
              <div class="relative">
                <div class="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-900">
                  <span class="text-white font-bold text-4xl">{{ username[0].toUpperCase() }}</span>
                </div>
                <div v-if="user.stats" class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-white mb-2">{{ user.displayName || username }}</h1>
                <p class="text-cyan-400 mb-3">@{{ username }}</p>
                
                
                <div class="flex flex-wrap gap-6 text-sm text-gray-300 mb-4">
                  <div><span class="font-semibold text-white">{{ user.stats.followers }}</span> followers</div>
                  <div><span class="font-semibold text-white">{{ user.stats.following }}</span> following</div>
                  <div><span class="font-semibold text-white">{{ user.stats.created }}</span> created</div>
                  <div><span class="font-semibold text-white">{{ user.stats.collected }}</span> collected</div>
                  <div>Joined {{ formatDate(user.joinedDate) }}</div>
                </div>

                
                <p v-if="user.bio" class="text-gray-300 mb-4 max-w-2xl">{{ user.bio }}</p>

                
                <div v-if="user.socialLinks" class="flex space-x-4 mb-4">
                  <a v-if="user.socialLinks.website" :href="user.socialLinks.website" target="_blank" class="text-cyan-400 hover:text-cyan-300">
                    🌐 Website
                  </a>
                  <a v-if="user.socialLinks.twitter" :href="`https://twitter.com/${user.socialLinks.twitter}`" target="_blank" class="text-cyan-400 hover:text-cyan-300">
                    🐦 Twitter
                  </a>
                </div>
              </div>

              
              <div v-if="!isOwnProfile" class="flex space-x-3">
                <button @click="followUser" class="nft-btn">
                  Follow
                </button>
                <button @click="showTransferModal = true" class="nft-btn bg-purple-600">
                  Send NFT
                </button>
              </div>
              <div v-else class="flex space-x-3">
                <button @click="router.push('/create')" class="nft-btn">
                  Create NFT
                </button>
                <button @click="router.push('/wallet')" class="nft-btn bg-purple-600">
                  My Wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        
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

        
        
        
        <div v-if="activeTab === 'collected'">
          <div v-if="Object.keys(groupedCollectedNFTs).length" class="space-y-8">
            <div v-for="(collectionNFTs, collection) in groupedCollectedNFTs" :key="collection">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <router-link :to="`/collection/${collection}`" class="text-cyan-400 hover:text-cyan-300">
                  {{ collection }}
                </router-link>
                <span class="text-sm text-gray-400">({{ collectionNFTs.length }})</span>
              </h3>
              
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div 
                  v-for="nft in collectionNFTs" 
                  :key="nft._id"
                  class="nft-panel p-0 overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer"
                  @click="router.push(`/nft/${collection}/${nft.tokenId}`)"
                >
                  <div class="aspect-square">
                    <img 
                      :src="nft.coverUrl || '/images/nfts/01.png'" 
                      :alt="nft.name"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div class="p-3">
                    <div class="font-medium text-white text-sm mb-1">{{ nft.name || `${collection} #${nft.instanceId}` }}</div>
                    <div class="text-xs text-gray-400">#{{ nft.instanceId }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-16">
            <div class="nft-panel p-8">
              <div class="text-6xl mb-4">🖼️</div>
              <h3 class="text-xl font-bold text-white mb-2">No NFTs Collected</h3>
              <p class="text-gray-400">{{ isOwnProfile ? 'You haven\'t collected any NFTs yet' : `${username} hasn't collected any NFTs yet` }}</p>
            </div>
          </div>
        </div>

        
        <div v-else-if="activeTab === 'created'">
          <div v-if="Object.keys(groupedCreatedNFTs).length" class="space-y-8">
            <div v-for="(collectionNFTs, collection) in groupedCreatedNFTs" :key="collection">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <router-link :to="`/collection/${collection}`" class="text-cyan-400 hover:text-cyan-300">
                  {{ collection }}
                </router-link>
                <span class="text-sm text-gray-400">({{ collectionNFTs.length }})</span>
              </h3>
              
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div 
                  v-for="nft in collectionNFTs" 
                  :key="nft._id"
                  class="nft-panel p-0 overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer"
                  @click="router.push(`/nft/${collection}/${nft.tokenId}`)"
                >
                  <div class="aspect-square">
                    <img 
                      :src="nft.coverUrl || '/images/nfts/01.png'" 
                      :alt="nft.name"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div class="p-3">
                    <div class="font-medium text-white text-sm mb-1">{{ nft.name || `${collection} #${nft.instanceId}` }}</div>
                    <div class="text-xs text-gray-400">#{{ nft.instanceId }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-16">
            <div class="nft-panel p-8">
              <div class="text-6xl mb-4">✨</div>
              <h3 class="text-xl font-bold text-white mb-2">No NFTs Created</h3>
              <p class="text-gray-400">{{ isOwnProfile ? 'You haven\'t created any NFTs yet' : `${username} hasn't created any NFTs yet` }}</p>
              <button v-if="isOwnProfile" @click="router.push('/create')" class="nft-btn mt-4">
                Create Your First NFT
              </button>
            </div>
          </div>
        </div>

        
        <div v-else-if="activeTab === 'collections'">
          <div v-if="userCollections.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="collection in userCollections" 
              :key="collection.symbol"
              class="nft-panel hover:transform hover:scale-105 transition-all cursor-pointer"
              @click="router.push(`/collection/${collection.symbol}`)"
            >
              <div class="h-32 mb-4 rounded-lg overflow-hidden">
                <img 
                  :src="collection.logoUrl || collection.logoUrl || '/images/collections/placeholder-banner.jpg'" 
                  :alt="collection.name"
                  class="w-full h-full object-cover"
                >
              </div>
              <h3 class="font-semibold text-white mb-2">{{ collection.name }}</h3>
              <p v-if="collection.description" class="text-sm text-gray-400 mb-3">{{ collection.description }}</p>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-400">{{ collection.maxSupply || 0 }} items</span>
                <span class="text-cyan-400">{{ collection.symbol }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-16">
            <div class="nft-panel p-8">
              <div class="text-6xl mb-4">📚</div>
              <h3 class="text-xl font-bold text-white mb-2">No Collections</h3>
              <p class="text-gray-400">{{ isOwnProfile ? 'You haven\'t created any collections yet' : `${username} hasn't created any collections yet` }}</p>
              <button v-if="isOwnProfile" @click="router.push('/create')" class="nft-btn mt-4">
                Create Collection
              </button>
            </div>
          </div>
        </div>

        
        <div v-else-if="activeTab === 'activity'">
          <div class="nft-panel">
            <h3 class="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div class="text-center py-8 text-gray-400">
              Activity history coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="showTransferModal" class="steem-auth-modal-overlay" @click="showTransferModal = false">
      <div class="steem-auth-modal-content" @click.stop>
        <div class="steem-auth-modal-header">
          <h2>Send NFT to {{ username }}</h2>
          <button @click="showTransferModal = false" class="steem-auth-close-button">&times;</button>
        </div>
        <div class="steem-auth-modal-body">
          <div class="text-center">
            <p class="text-gray-300 mb-4">NFT transfer functionality coming soon...</p>
            <p class="text-sm text-gray-400">You'll be able to send NFTs directly to other users.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
