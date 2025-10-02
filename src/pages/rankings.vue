<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiService } from '../composables/useApiService'
import { useRouter, useRoute } from 'vue-router';

const api = useApiService()
const router = useRouter();
const route = useRoute();
// State
const collections = ref<any[]>([])
const trending = ref<any[]>([])
const topCreators = ref<any[]>([])
const loading = ref(true)
const activeTab = ref('collections')

const tabs = [
  { id: 'collections', name: 'Top Collections', icon: '🏆' },
  { id: 'trending', name: 'Trending', icon: '🔥' },
  { id: 'creators', name: 'Top Creators', icon: '👨‍🎨' }
]

// Load rankings data
onMounted(async () => {
  try {
    loading.value = true
    const [collectionsResp, listingsResp] = await Promise.all([
      api.getNftCollections({ limit: 100 }),
      api.getNftMarketListings({ limit: 100, sortBy: 'listedAt', sortDirection: 'DESC' })
    ])

    // Collections ranking (placeholder volume sorting until real volume API exists)
    const mappedCols = (collectionsResp?.data || []).map((c: any) => ({
      id: c.symbol,
      name: c.name,
      creator: c.creator,
      image: c.logoUrl,
      floorPrice: 0,
      volume: 0,
      items: c.currentSupply || c.maxSupply || 0,
      owners: 0,
      change24h: 0
    }))
    collections.value = mappedCols

    // Trending NFTs approximation from recent listings
    trending.value = (listingsResp?.data || []).slice(0, 12).map((l: any) => ({
      id: l.instanceId,
      name: l.name || `${l.collectionSymbol} #${l.instanceId}`,
      image: l.coverUrl || l.uri,
      collection: l.collectionSymbol,
      price: l.price,
      trending: Math.floor(Math.random() * 50) // placeholder
    }))

    // TODO: Load top creators data from API when available
    topCreators.value = []
  } catch (err) {
    console.error('Failed to load rankings:', err)
  } finally {
    loading.value = false
  }
})

// Format volume
const formatVolume = (volume: number) => {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
  return volume.toFixed(1)
}

// Format percentage change
const formatChange = (change: number) => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

// Get change color
const getChangeColor = (change: number) => {
  return change >= 0 ? 'text-green-400' : 'text-red-400'
}
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-4">Rankings</h1>
        <p class="text-gray-300">Top performing collections, trending NFTs, and leading creators</p>
      </div>


      <div class="flex space-x-1 mb-8">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
          'flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all',
          activeTab === tab.id
            ? 'bg-cyan-500 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        ]">
          <span>{{ tab.icon }}</span>
          <span>{{ tab.name }}</span>
        </button>
      </div>


      <div v-if="loading" class="flex justify-center py-16">
        <div class="steem-auth-spinner"></div>
      </div>


      <div v-else-if="activeTab === 'collections'" class="bg-white dark:bg-gradient-to-br dark:from-primary-900 dark:to-primary-800 border border-gray-200 dark:border-primary-700 rounded-lg overflow-hidden p-6">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="text-left py-4 text-gray-400 font-medium">#</th>
                <th class="text-left py-4 text-gray-400 font-medium">Collection</th>
                <th class="text-left py-4 text-gray-400 font-medium">Floor Price</th>
                <th class="text-left py-4 text-gray-400 font-medium">Volume</th>
                <th class="text-left py-4 text-gray-400 font-medium">24h Change</th>
                <th class="text-left py-4 text-gray-400 font-medium">Items</th>
                <th class="text-left py-4 text-gray-400 font-medium">Owners</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(collection, index) in collections" :key="collection.id"
                class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                @click="router.push(`/collection/${collection.id}`)">
                <td class="py-4">
                  <span class="text-gray-400 font-medium">{{ index + 1 }}</span>
                </td>
                <td class="py-4">
                  <div class="flex items-center space-x-3">
                    <img :src="collection.image || '/images/collections/cryptoheroes.jpg'" :alt="collection.name"
                      class="w-12 h-12 rounded-lg object-cover">
                    <div>
                      <div class="font-semibold text-white">{{ collection.name }}</div>
                      <div class="text-sm text-gray-400">by <router-link :to="`/profile/${collection.creator}`"
                          class="text-cyan-400">{{ collection.creator }}</router-link></div>
                    </div>
                  </div>
                </td>
                <td class="py-4">
                  <div class="font-medium text-white">{{ collection.floorPrice || '0' }} STEEM</div>
                </td>
                <td class="py-4">
                  <div class="font-medium text-white">{{ formatVolume(collection.volume || 0) }} STEEM</div>
                </td>
                <td class="py-4">
                  <div :class="getChangeColor(collection.change24h || 0)">
                    {{ formatChange(collection.change24h || 0) }}
                  </div>
                </td>
                <td class="py-4">
                  <div class="text-gray-300">{{ collection.items || 0 }}</div>
                </td>
                <td class="py-4">
                  <div class="text-gray-300">{{ collection.owners || 0 }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      <div v-else-if="activeTab === 'trending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="nft in trending" :key="nft.id"
          class="bg-white dark:bg-gradient-to-br dark:from-primary-900 dark:to-primary-800 border border-gray-200 dark:border-primary-700 rounded-lg overflow-hidden p-6 hover:transform hover:scale-105 transition-all cursor-pointer"
          @click="router.push(`/nft/${nft.collection}/${nft.id}`)">
          <div class="aspect-square mb-4 rounded-lg overflow-hidden">
            <img :src="nft.coverUrl || '/images/nfts/01.png'" :alt="nft.name" class="w-full h-full object-cover">
          </div>
          <h3 class="font-semibold text-white mb-2">{{ nft.name }}</h3>
          <div class="text-sm text-gray-400 mb-2">{{ nft.collection }}</div>
          <div class="flex justify-between items-center">
            <div class="font-bold text-cyan-400">{{ nft.price }} STEEM</div>
            <div class="text-sm text-green-400">+{{ nft.trending }}%</div>
          </div>
        </div>
      </div>


      <div v-else-if="activeTab === 'creators'" class="bg-white dark:bg-gradient-to-br dark:from-primary-900 dark:to-primary-800 border border-gray-200 dark:border-primary-700 rounded-lg overflow-hidden p-6">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="text-left py-4 text-gray-400 font-medium">#</th>
                <th class="text-left py-4 text-gray-400 font-medium">Creator</th>
                <th class="text-left py-4 text-gray-400 font-medium">NFTs Created</th>
                <th class="text-left py-4 text-gray-400 font-medium">Total Volume</th>
                <th class="text-left py-4 text-gray-400 font-medium">Followers</th>
                <th class="text-left py-4 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(creator, index) in topCreators" :key="creator.username"
                class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td class="py-4">
                  <span class="text-gray-400 font-medium">{{ index + 1 }}</span>
                </td>
                <td class="py-4">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold text-lg">{{ creator.username[0].toUpperCase() }}</span>
                    </div>
                    <div>
                      <div class="font-semibold text-white">{{ creator.username }}</div>
                      <div class="text-sm text-gray-400">Creator</div>
                    </div>
                  </div>
                </td>
                <td class="py-4">
                  <div class="font-medium text-white">{{ creator.nfts }}</div>
                </td>
                <td class="py-4">
                  <div class="font-medium text-white">{{ formatVolume(creator.volume) }} STEEM</div>
                </td>
                <td class="py-4">
                  <div class="text-gray-300">{{ creator.followers }}</div>
                </td>
                <td class="py-4">
                  <button @click="router.push(`/profile/${creator.username}`)"
                    class="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                    View Profile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      <div v-if="!loading && collections.length === 0 && activeTab === 'collections'" class="text-center py-16">
        <div class="bg-white dark:bg-gradient-to-br dark:from-primary-900 dark:to-primary-800 border border-gray-200 dark:border-primary-700 rounded-lg overflow-hidden p-6 p-8">
          <div class="text-6xl mb-4">🏆</div>
          <h3 class="text-xl font-bold text-white mb-2">No Collections Found</h3>
          <p class="text-gray-400">No collection rankings available yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
