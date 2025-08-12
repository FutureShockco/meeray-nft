<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiService } from '../composables/useApiService'

const route = useRoute()
const router = useRouter()
const api = useApiService()

// State
const searchQuery = ref((route.query.q as string) || '')
const searchResults = ref<any>({
  nfts: [],
  collections: [],
  users: []
})
const loading = ref(false)
const activeTab = ref('all')
const filters = ref({
  priceMin: '',
  priceMax: '',
  category: '',
  status: '',
  sortBy: 'relevance'
})

const tabs = [
  { id: 'all', name: 'All', count: 0 },
  { id: 'nfts', name: 'NFTs', count: 0 },
  { id: 'collections', name: 'Collections', count: 0 },
  { id: 'users', name: 'Users', count: 0 }
]

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'art', label: 'Art' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'collectibles', label: 'Collectibles' }
]

const statusOptions = [
  { value: '', label: 'All Items' },
  { value: 'listed', label: 'Buy Now' },
  { value: 'auction', label: 'On Auction' },
  { value: 'sold', label: 'Recently Sold' }
]

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Recently Created' },
  { value: 'oldest', label: 'Oldest' }
]

// Perform search
const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  try {
    // Update URL
    router.replace({ query: { q: searchQuery.value } })
    
    // TODO: Implement actual search API calls
    const [nftTokens, collections] = await Promise.all([
      api.getNftTokens({ search: searchQuery.value }),
      api.getNftCollections({ search: searchQuery.value })
    ])
    
    searchResults.value = {
      nfts: nftTokens || [],
      collections: collections || [],
      users: [] // Would come from user search API
    }
    
    // Update tab counts
    tabs[0].count = searchResults.value.nfts.length + searchResults.value.collections.length + searchResults.value.users.length
    tabs[1].count = searchResults.value.nfts.length
    tabs[2].count = searchResults.value.collections.length
    tabs[3].count = searchResults.value.users.length
    
  } catch (err) {
    console.error('Search failed:', err)
  } finally {
    loading.value = false
  }
}

// Watch for query changes
watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery !== searchQuery.value) {
    searchQuery.value = newQuery as string
    performSearch()
  }
})

// Initial search
onMounted(() => {
  if (searchQuery.value) {
    performSearch()
  }
})

// Filtered results based on active tab
const filteredResults = computed(() => {
  switch (activeTab.value) {
    case 'nfts':
      return { nfts: searchResults.value.nfts, collections: [], users: [] }
    case 'collections':
      return { nfts: [], collections: searchResults.value.collections, users: [] }
    case 'users':
      return { nfts: [], collections: [], users: searchResults.value.users }
    default:
      return searchResults.value
  }
})

// Handle search submit
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    performSearch()
  }
}

// Clear filters
const clearFilters = () => {
  filters.value = {
    priceMin: '',
    priceMax: '',
    category: '',
    status: '',
    sortBy: 'relevance'
  }
  performSearch()
}
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-4">Search Results</h1>
        
        
        <div class="flex gap-4 mb-6">
          <div class="flex-1 relative">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search items, collections, and accounts"
              class="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-900/80 text-white border border-gray-700 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              @keyup.enter="handleSearch"
            >
            <button 
              @click="handleSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
        </div>

        
        <div v-if="searchQuery" class="text-gray-300">
          Searching for: <span class="text-white font-semibold">"{{ searchQuery }}"</span>
        </div>
      </div>

      
      <div class="nft-panel mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select v-model="filters.category" class="steem-auth-select">
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select v-model="filters.status" class="steem-auth-select">
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
            <input 
              v-model="filters.priceMin" 
              type="number" 
              placeholder="0"
              class="steem-auth-input"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
            <input 
              v-model="filters.priceMax" 
              type="number" 
              placeholder="∞"
              class="steem-auth-input"
            >
          </div>

          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select v-model="filters.sortBy" class="steem-auth-select">
              <option v-for="sort in sortOptions" :key="sort.value" :value="sort.value">
                {{ sort.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
          <button @click="clearFilters" class="text-sm text-gray-400 hover:text-white transition-colors">
            Clear Filters
          </button>
          <button @click="performSearch" class="nft-btn">
            Apply Filters
          </button>
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
          <span>{{ tab.name }}</span>
          <span v-if="tab.count > 0" class="bg-gray-600 text-xs px-2 py-1 rounded-full">{{ tab.count }}</span>
        </button>
      </div>

      
      <div v-if="loading" class="flex justify-center py-16">
        <div class="steem-auth-spinner"></div>
      </div>

      
      <div v-else-if="searchQuery">
        
        <div v-if="filteredResults.nfts?.length && (activeTab === 'all' || activeTab === 'nfts')" class="mb-12">
          <h2 v-if="activeTab === 'all'" class="text-xl font-bold text-white mb-6">NFTs</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div 
              v-for="nft in filteredResults.nfts" 
              :key="`${nft.collection}-${nft.id}`"
              class="nft-panel p-0 overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer"
              @click="$router.push(`/nft/${nft.collection}/${nft.id}`)"
            >
              <div class="aspect-square">
                <img 
                  :src="nft.image || '/images/nfts/01.png'" 
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

        
        <div v-if="filteredResults.collections?.length && (activeTab === 'all' || activeTab === 'collections')" class="mb-12">
          <h2 v-if="activeTab === 'all'" class="text-xl font-bold text-white mb-6">Collections</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="collection in filteredResults.collections" 
              :key="collection.id"
              class="nft-panel hover:transform hover:scale-105 transition-all cursor-pointer"
              @click="$router.push(`/collections/${collection.id}`)"
            >
              <div class="h-32 mb-4 rounded-lg overflow-hidden">
                <img 
                  :src="collection.bannerImage || collection.image || '/images/collections/cryptoheroes-banner.jpg'" 
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

        
        <div v-if="filteredResults.users?.length && (activeTab === 'all' || activeTab === 'users')" class="mb-12">
          <h2 v-if="activeTab === 'all'" class="text-xl font-bold text-white mb-6">Users</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="user in filteredResults.users" 
              :key="user.username"
              class="nft-panel hover:transform hover:scale-105 transition-all cursor-pointer"
              @click="$router.push(`/profile/${user.username}`)"
            >
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-xl">{{ user.username[0].toUpperCase() }}</span>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-white">{{ user.username }}</h3>
                  <div class="text-sm text-gray-400">{{ user.nftsCreated || 0 }} NFTs created</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div v-if="!filteredResults.nfts?.length && !filteredResults.collections?.length && !filteredResults.users?.length">
          <div class="text-center py-16">
            <div class="nft-panel p-8">
              <div class="text-6xl mb-4">🔍</div>
              <h3 class="text-xl font-bold text-white mb-2">No Results Found</h3>
              <p class="text-gray-400 mb-6">Try adjusting your search terms or filters</p>
              <button @click="clearFilters" class="nft-btn">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      
      <div v-else class="text-center py-16">
        <div class="nft-panel p-8">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-bold text-white mb-2">Start Searching</h3>
          <p class="text-gray-400">Enter a search term to find NFTs, collections, and users</p>
        </div>
      </div>
    </div>
  </div>
</template>
