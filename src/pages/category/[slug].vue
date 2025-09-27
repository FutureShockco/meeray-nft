<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { useApiService } from '../../composables/useApiService'

const router = useRouter();
const route = useRoute();
const api = useApiService()

// Route params
const categorySlug = route.params.slug as string

// State
const nfts = ref<any[]>([])
const collections = ref<any[]>([])
const loading = ref(true)
const sortBy = ref('newest')
const viewMode = ref('grid')

// Category definitions
type CategoryKey = 'art' | 'gaming' | 'music' | 'sports' | 'collectibles' | 'photography'
type Category = {
  name: string
  description: string
  icon: string
  color: string
}
const categories: Record<CategoryKey, Category> = {
  art: {
    name: 'Digital Art',
    description: 'Unique digital artworks and creative expressions',
    icon: '🎨',
    color: 'from-pink-500 to-purple-600'
  },
  gaming: {
    name: 'Gaming',
    description: 'Game items, characters, and collectibles',
    icon: '🎮',
    color: 'from-green-500 to-blue-600'
  },
  music: {
    name: 'Music',
    description: 'Musical NFTs, albums, and audio collectibles',
    icon: '🎵',
    color: 'from-purple-500 to-pink-600'
  },
  sports: {
    name: 'Sports',
    description: 'Sports memorabilia and athlete collectibles',
    icon: '⚽',
    color: 'from-orange-500 to-red-600'
  },
  collectibles: {
    name: 'Collectibles',
    description: 'Trading cards, rare items, and unique collectibles',
    icon: '💎',
    color: 'from-cyan-500 to-blue-600'
  },
  photography: {
    name: 'Photography',
    description: 'Stunning photographs and visual stories',
    icon: '📷',
    color: 'from-yellow-500 to-gray-600'
  }
}

const currentCategory = computed(() => {
  return categories[categorySlug as CategoryKey] || {
    name: 'Category',
    description: 'Browse items in this category',
    icon: '📦',
    color: 'from-gray-500 to-gray-600'
  }
})

const sortOptions = [
  { value: 'newest', label: 'Recently Created' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'most_liked', label: 'Most Liked' },
  { value: 'trending', label: 'Trending' }
]

// Load category data
onMounted(async () => {
  try {
    loading.value = true
    
  // Fetch NFTs and collections related to this category using supported endpoints
  const [nftResp, collectionResp] = await Promise.all([
    api.getNftInstances({ limit: 200, metadataKey: 'category', metadataValue: categorySlug }),
    api.getNftCollections({ nameSearch: categorySlug, limit: 50 })
  ])
  
  // Map NFTs to a simple UI shape expected by this page
  nfts.value = (nftResp?.data || []).map((inst: any) => ({
    id: inst.instanceId,
    name: inst.metadata?.name || `${inst.collectionSymbol} #${inst.instanceId}`,
    image: inst.uri,
    collection: inst.collectionSymbol,
    creator: inst.creator || inst.owner,
    price: inst.price,
    likes: inst.likes || 0,
    createdAt: inst.createdAt
  }))
  
  collections.value = collectionResp?.data || []
  } catch (err) {
    console.error('Failed to load category data:', err)
  } finally {
    loading.value = false
  }
})

// Sorted NFTs
const sortedNFTs = computed(() => {
  const sorted = [...nfts.value]
  
  switch (sortBy.value) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'price_low':
      return sorted.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0))
    case 'price_high':
      return sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
    case 'most_liked':
      return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    default:
      return sorted
  }
})

// Get all categories for navigation
const allCategories = computed(() => {
  return Object.entries(categories).map(([slug, data]) => ({
    slug,
    ...data
  }))
})
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      
      <div class="mb-8">
        <div :class="['text-center py-16 rounded-2xl bg-gradient-to-r', currentCategory.color]">
          <div class="text-6xl mb-4">{{ currentCategory.icon }}</div>
          <h1 class="text-4xl font-bold text-white mb-4">{{ currentCategory.name }}</h1>
          <p class="text-xl text-white/80 max-w-2xl mx-auto">{{ currentCategory.description }}</p>
        </div>
      </div>

      
      <div class="nft-panel mb-8">
        <h3 class="text-lg font-bold text-white mb-4">Browse Categories</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <router-link
            v-for="category in allCategories"
            :key="category.slug"
            :to="`/category/${category.slug}`"
            :class="[
              'flex flex-col items-center p-4 rounded-lg transition-all hover:transform hover:scale-105',
              categorySlug === category.slug 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            ]"
          >
            <div class="text-2xl mb-2">{{ category.icon }}</div>
            <div class="text-sm font-medium text-center">{{ category.name }}</div>
          </router-link>
        </div>
      </div>

      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div class="nft-panel text-center">
          <div class="text-2xl font-bold text-cyan-400">{{ nfts.length }}</div>
          <div class="text-sm text-gray-400">Items</div>
        </div>
        <div class="nft-panel text-center">
          <div class="text-2xl font-bold text-purple-400">{{ collections.length }}</div>
          <div class="text-sm text-gray-400">Collections</div>
        </div>
        <div class="nft-panel text-center">
          <div class="text-2xl font-bold text-green-400">-</div>
          <div class="text-sm text-gray-400">Floor Price</div>
        </div>
        <div class="nft-panel text-center">
          <div class="text-2xl font-bold text-yellow-400">-</div>
          <div class="text-sm text-gray-400">Volume</div>
        </div>
      </div>

      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div class="flex items-center space-x-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
            <select v-model="sortBy" class="steem-auth-select">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-400">View:</span>
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded',
              viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'
            ]"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded',
              viewMode === 'list' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'
            ]"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
            </svg>
          </button>
        </div>
      </div>

      
      <div v-if="loading" class="flex justify-center py-16">
        <div class="steem-auth-spinner"></div>
      </div>

      
      <div v-else-if="collections.length" class="mb-12">
        <h2 class="text-2xl font-bold text-white mb-6">Featured Collections</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="collection in collections" 
            :key="collection.id"
            class="nft-panel hover:transform hover:scale-105 transition-all cursor-pointer"
            @click="router.push(`/collections/${collection.id}`)"
          >
            <div class="h-32 mb-4 rounded-lg overflow-hidden">
              <img 
                :src="collection.logoUrl || collection.image || '/images/collections/cryptoheroes-banner.jpg'" 
                :alt="collection.name"
                class="w-full h-full object-cover"
              >
            </div>
            <h3 class="font-semibold text-white mb-2">{{ collection.name }}</h3>
            <div class="text-sm text-gray-400 mb-2">by {{ collection.creator }}</div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-400">{{ collection.items }} items</span>
              <span v-if="collection.floorPrice" class="text-cyan-400">{{ collection.floorPrice }} STEEM</span>
            </div>
          </div>
        </div>
      </div>

      
      <div v-if="viewMode === 'grid' && sortedNFTs.length">
        <h2 class="text-2xl font-bold text-white mb-6">All Items</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div 
            v-for="nft in sortedNFTs" 
            :key="`${nft.collection}-${nft.id}`"
            class="nft-panel p-0 overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer"
            @click="router.push(`/nft/${nft.collection}/${nft.id}`)"
          >
            <div class="aspect-square">
              <img 
                :src="nft.coverUrl || '/images/nfts/01.png'" 
                :alt="nft.name"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-white mb-2">{{ nft.name }}</h3>
              <div class="text-sm text-gray-400 mb-2">{{ nft.collection }}</div>
              <div v-if="nft.price" class="font-bold text-cyan-400">{{ nft.price }} STEEM</div>
            </div>
          </div>
        </div>
      </div>

      
      <div v-else-if="viewMode === 'list' && sortedNFTs.length">
        <h2 class="text-2xl font-bold text-white mb-6">All Items</h2>
        <div class="space-y-4">
          <div 
            v-for="nft in sortedNFTs" 
            :key="`${nft.collection}-${nft.id}`"
            class="nft-panel hover:transform hover:scale-[1.01] transition-all cursor-pointer"
            @click="router.push(`/nft/${nft.collection}/${nft.id}`)"
          >
            <div class="flex items-center space-x-4">
              <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  :src="nft.coverUrl || '/images/nfts/01.png'" 
                  :alt="nft.name"
                  class="w-full h-full object-cover"
                >
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-white mb-1">{{ nft.name }}</h3>
                <div class="text-sm text-gray-400 mb-2">{{ nft.collection }}</div>
                <div class="flex items-center space-x-4 text-sm text-gray-400">
                  <span>by <router-link :to="`/profile/${nft.creator}`" class="text-cyan-400">{{ nft.creator }}</router-link></span>
                  <span v-if="nft.likes">{{ nft.likes }} likes</span>
                </div>
              </div>
              <div v-if="nft.price" class="text-right flex-shrink-0">
                <div class="font-bold text-white">{{ nft.price }} STEEM</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div v-else-if="!loading && !sortedNFTs.length">
        <div class="text-center py-16">
          <div class="nft-panel p-8">
            <div class="text-6xl mb-4">{{ currentCategory.icon }}</div>
            <h3 class="text-xl font-bold text-white mb-2">No Items Found</h3>
            <p class="text-gray-400 mb-6">No NFTs found in this category yet.</p>
            <button @click="router.push('/marketplace')" class="nft-btn">
              Browse All Items
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
