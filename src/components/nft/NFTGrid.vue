<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Props and interfaces
interface NFTCollection {
  id: string;
  name: string;
}

interface NFTProperty {
  trait_type: string;
  value: string;
}

interface NFT {
  id: number;
  name: string;
  description: string;
  image: string;
  collection: NFTCollection;
  owner: string;
  creator: string;
  price?: number;
  currency?: string;
  isListed: boolean;
  properties: NFTProperty[];
  royalties: number;
  createdAt: string;
  likes: number;
  views: number;
  history: {
    id: number;
    type: 'mint' | 'transfer' | 'list' | 'sale' | 'offer' | 'burn';
    from: string;
    to?: string;
    price?: number;
    timestamp: string;
  }[];
}

const props = defineProps<{
  nfts: NFT[];
  showFilters?: boolean;
  title?: string;
  emptyMessage?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  buy: [nft: NFT];
  makeoffer: [nft: NFT, price: number];
  transfer: [nft: NFT, address: string];
  burn: [nft: NFT];
  list: [nft: NFT, price: number, currency: string];
  filter: [filters: any];
}>();

// State
const search = ref('');
const selectedCollection = ref<string>('');
const priceMin = ref<number | null>(null);
const priceMax = ref<number | null>(null);
const sortBy = ref('newest');

const favoriteNFTs = ref<number[]>([]);
const gridView = ref('grid'); // grid or list

// Computed properties
const collections = computed(() => {
  const uniqueCollections = new Map<string, NFTCollection>();
  props.nfts.forEach(nft => {
    if (!uniqueCollections.has(nft.collection.id)) {
      uniqueCollections.set(nft.collection.id, nft.collection);
    }
  });
  return Array.from(uniqueCollections.values());
});

const filteredNFTs = computed(() => {
  let result = [...props.nfts];
  
  // Filter by search
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(nft => 
      nft.name.toLowerCase().includes(searchLower) || 
      nft.description.toLowerCase().includes(searchLower) ||
      nft.owner.toLowerCase().includes(searchLower) ||
      nft.creator.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by collection
  if (selectedCollection.value) {
    result = result.filter(nft => nft.collection.id === selectedCollection.value);
  }
  
  // Filter by price range
  if (priceMin.value !== null) {
    result = result.filter(nft => !nft.price || nft.price >= (priceMin.value || 0));
  }
  
  if (priceMax.value !== null) {
    result = result.filter(nft => !nft.price || nft.price <= (priceMax.value || Infinity));
  }
  
  // Sort
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'price-low':
      result.sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return a.price - b.price;
      });
      break;
    case 'price-high':
      result.sort((a, b) => {
        if (!a.price) return 1;
        if (!b.price) return -1;
        return b.price - a.price;
      });
      break;
    case 'likes':
      result.sort((a, b) => b.likes - a.likes);
      break;
    case 'views':
      result.sort((a, b) => b.views - a.views);
      break;
  }
  
  return result;
});

// Watch for filter changes
watch([search, selectedCollection, priceMin, priceMax, sortBy], () => {
  emit('filter', {
    search: search.value,
    collection: selectedCollection.value,
    priceMin: priceMin.value,
    priceMax: priceMax.value,
    sortBy: sortBy.value
  });
}, { deep: true });

// Methods
import { useRouter } from 'vue-router';

const router = useRouter();

function openNFTDetail(nft: NFT) {
  router.push(`/nft/${nft.collection.id}/${nft.id}`);
}



function resetFilters() {
  search.value = '';
  selectedCollection.value = '';
  priceMin.value = null;
  priceMax.value = null;
  sortBy.value = 'newest';
}

function toggleFavorite(nftId: number) {
  const index = favoriteNFTs.value.indexOf(nftId);
  if (index === -1) {
    favoriteNFTs.value.push(nftId);
  } else {
    favoriteNFTs.value.splice(index, 1);
  }
}

function isFavorite(nftId: number) {
  return favoriteNFTs.value.includes(nftId);
}

// Event handlers for NFT actions
function handleBuy(nft: NFT) {
  emit('buy', nft);
}

function handleMakeOffer(nft: NFT, price: number) {
  emit('makeoffer', nft, price);
}

function handleTransfer(nft: NFT, address: string) {
  emit('transfer', nft, address);
}

function handleBurn(nft: NFT) {
  emit('burn', nft);
}

function handleList(nft: NFT, price: number, currency: string) {
  emit('list', nft, price, currency);
}
</script>

<template>
  <div>
    <!-- Filters section -->
    <div v-if="showFilters" class="mb-8 border border-gray-700 rounded-lg p-4 bg-gray-900/50 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Search filter -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Search</label>
          <div class="relative">
            <input
              v-model="search"
              type="text"
              placeholder="Name, creator..."
              class="w-full pl-10 pr-4 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
            />
            <div class="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Collection filter -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Collection</label>
          <select
            v-model="selectedCollection"
            class="w-full py-2 px-4 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white focus:outline-none appearance-none"
          >
            <option value="">All Collections</option>
            <option v-for="collection in collections" :key="collection.id" :value="collection.id">
              {{ collection.name }}
            </option>
          </select>
        </div>

        <!-- Price range filter -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Price Range (STEEM)</label>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <input
                v-model="priceMin"
                type="number"
                min="0"
                step="0.01"
                placeholder="Min"
                class="w-full py-2 px-4 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                v-model="priceMax"
                type="number"
                min="0"
                step="0.01"
                placeholder="Max"
                class="w-full py-2 px-4 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Sort filter -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Sort By</label>
          <select
            v-model="sortBy"
            class="w-full py-2 px-4 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white focus:outline-none appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="likes">Most Liked</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      <!-- Clear filters button -->
      <div class="mt-4 flex justify-end">
        <button
          @click="resetFilters"
          class="nft-btn text-sm">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Title and view controls -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 v-if="title" class="text-xl font-bold text-white mb-4 sm:mb-0 neon-text">{{ title }}</h2>
      
      <div class="flex items-center space-x-4">
        <!-- Grid view toggle -->
        <div class="flex rounded-lg border border-gray-700 overflow-hidden">
          <button 
            @click="gridView = 'grid'" 
            :class="[
              'px-3 py-2 border-r border-gray-700', 
              gridView === 'grid' ? 'bg-purple-900/50 text-cyan-400' : 'bg-gray-900 text-gray-400 hover:text-white'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button 
            @click="gridView = 'list'" 
            :class="[
              'px-3 py-2', 
              gridView === 'list' ? 'bg-purple-900/50 text-cyan-400' : 'bg-gray-900 text-gray-400 hover:text-white'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="py-10 flex justify-center items-center">
      <div class="w-12 h-12 border-4 border-t-cyan-400 border-r-purple-600 border-b-cyan-400 border-l-purple-600 rounded-full animate-spin"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredNFTs.length === 0" class="text-center py-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-4 text-xl text-gray-300">{{ emptyMessage || 'No NFTs found' }}</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="gridView === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="nft in filteredNFTs" 
        :key="nft.id"
        @click="openNFTDetail(nft)"
        class="nft-card cursor-pointer rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300"
      >
        <!-- NFT Image -->
        <div class="relative h-48 overflow-hidden group">
          <img :src="nft.image" :alt="nft.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
          
          <!-- Favorite button -->
          <button 
            @click.stop="toggleFavorite(nft.id)" 
            class="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:text-pink-500"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5" 
              :class="{'text-pink-500 fill-pink-500': isFavorite(nft.id)}"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          <!-- Listed badge -->
          <div v-if="nft.isListed" class="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
            For Sale
          </div>
        </div>
        
        <!-- NFT Info -->
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-bold text-white text-lg">{{ nft.name }}</h3>
              <p class="text-sm text-gray-400">{{ nft.collection.name }}</p>
            </div>
            <div class="bg-gray-800/50 rounded-lg px-2 py-1">
              <span class="text-xs font-medium text-cyan-400">#{{ nft.id }}</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between mt-4">
            <div>
              <p class="text-xs text-gray-400">Price</p>
              <p class="font-bold text-white">
                {{ nft.price ? `${nft.price} ${nft.currency}` : 'Not for sale' }}
              </p>
            </div>
            <button 
              v-if="nft.isListed"
              @click.stop="handleBuy(nft)"
              class="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white transition-colors"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="space-y-4">
      <div 
        v-for="nft in filteredNFTs" 
        :key="nft.id"
        @click="openNFTDetail(nft)"
        class="nft-card cursor-pointer rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 bg-gray-900 flex"
      >
        <!-- NFT Image -->
        <div class="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden">
          <img :src="nft.image" :alt="nft.name" class="h-full w-full object-cover hover:scale-110 transition-transform duration-500">
        </div>
        
        <!-- NFT Info -->
        <div class="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 class="font-bold text-white">{{ nft.name }}</h3>
            <p class="text-sm text-gray-400">{{ nft.collection.name }}</p>
            <p class="text-xs text-gray-500 mt-1">Owned by: {{ nft.owner }}</p>
          </div>
          
          <div class="mt-4 sm:mt-0 flex items-center">
            <div class="text-right">
              <p class="text-xs text-gray-400">Price</p>
              <p class="font-bold text-white">
                {{ nft.price ? `${nft.price} ${nft.currency}` : 'Not for sale' }}
              </p>
            </div>
            
            <div class="ml-6 flex space-x-2">
              <button 
                @click.stop="toggleFavorite(nft.id)" 
                class="h-8 w-8 flex items-center justify-center rounded-full bg-gray-800 text-white hover:text-pink-500"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  class="h-5 w-5" 
                  :class="{'text-pink-500 fill-pink-500': isFavorite(nft.id)}"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              <button 
                v-if="nft.isListed"
                @click.stop="handleBuy(nft)"
                class="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white transition-colors"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template> 