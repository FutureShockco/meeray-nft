<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApiService } from '../composables/useApiService';
import NFTGrid from '../components/nft/NFTGrid.vue';
import type { UINFT, UINFTCollection, UIUserProfile } from '../types/models';




// Get route and router to handle navigation
const route = useRoute();
const router = useRouter();
const api = useApiService();

// Interface for NFT data structure
type NFT = UINFT;

// Interface for NFT collection
type NFTCollection = UINFTCollection;

// Interface for User Profile
type UserProfile = UIUserProfile;



// Collection state based on route
const selectedCollection = computed<NFTCollection | null>(() => {
  const collectionId = route.query.collection as string;
  if (!collectionId) return null;

  return nftCollections.value.find(c => c.id === collectionId) || null;
});

const selectedCollectionNFTs = computed<NFT[]>(() => {
  if (!selectedCollection.value) return [];
  return nftsData.value.filter((nft: any) => nft?.collection?.id === selectedCollection.value?.id);
});

// Data loading states
const isLoading = ref(true);
const nftsData = ref<NFT[]>([]);
const nftCollections = ref<NFTCollection[]>([]);

// Load collections and NFTs from API
onMounted(async () => {
  try {
    isLoading.value = true;

    // Load NFT collections from API
    console.log('Loading collections...');
    const collectionsResponse = await api.getNftCollections({ limit: 50 });
    console.log('Collections loaded:', collectionsResponse);
    // Map API response to expected format
    nftCollections.value = (collectionsResponse.data || []).map(collection => ({
      id: collection.symbol,
      title: collection.name,
      creator: collection.creator,
      logoUrl: collection.logoUrl || '/images/collections/placeholder.jpg',
      bannerImage: collection.bannerImage || '/images/collections/placeholder-banner.jpg',
      floorPrice: collection.floorPrice || 0, // Would need separate API call to calculate
      items: collection.currentSupply || 0,
      maxSupply: collection.maxSupply === 9007199254740991 ? "∞" : (collection.maxSupply || 0),
      description: collection.description || '',
      owners: 0, // Would need separate API call
      volume: collection.volume || 0, // Would need separate API call
      links: {
        website: collection.websiteUrl || '',
        twitter: '',
        discord: ''
      }
    }));

    // Load NFT instances from API
    const nftsResponse = await api.getNftInstances({ limit: 100 });
    // Map API instances to grid-friendly shape to avoid undefined errors
    nftsData.value = (nftsResponse.data || []).map((inst: any, idx: number) => ({
      id: Number(inst.instanceId) || idx + 1,
      name: `${inst.collectionSymbol} #${inst.instanceId}`,
      description: '',
      coverUrl: inst.coverUrl || '/images/placeholder-logo.jpg',
      collection: { id: inst.collectionSymbol, name: inst.collectionSymbol },
      owner: inst.owner || '',
      creator: inst.creator || '',
      price: undefined,
      currency: undefined,
      isListed: false,
      floorPrice: 0,
      volume: 0,
      metadata: [],
      royalties: 0,
      createdAt: inst.createdAt || new Date().toISOString(),
      likes: 0,
      views: 0,
      history: []
    }));

  } catch (error) {
    console.error('Failed to load collections data:', error);
  } finally {
    isLoading.value = false;
  }
});

function openCreateCollectionModal() {
  router.push('/create?mode=collection');
}

function closeCollectionDetail() {
  // Remove collection parameter from URL
  router.push({
    path: route.path,
    query: { ...route.query, collection: undefined }
  });
}

function handleBuyNFT(nft: NFT) {
  console.log('Buy NFT:', nft);
  // In a real app, you would integrate with a blockchain wallet here
}

function handleMakeOffer(nft: NFT, price: number) {
  console.log('Make offer on NFT:', nft, 'Price:', price);
  // In a real app, you would integrate with a blockchain wallet here
}

function handleTransferNFT(nft: NFT, address: string) {
  console.log('Transfer NFT:', nft, 'To address:', address);
  // In a real app, you would integrate with a blockchain wallet here
}

function handleBurnNFT(nft: NFT) {
  console.log('Burn NFT:', nft);

  // Remove from local state
  nftsData.value = nftsData.value.filter(item => item.id !== nft.id);
}

function handleListNFT(nft: NFT, price: number, currency: string) {
  console.log('List NFT:', nft, 'Price:', price, 'Currency:', currency);

  // Update local state
  const index = nftsData.value.findIndex(item => item.id === nft.id);
  if (index !== -1) {
    nftsData.value[index] = {
      ...nftsData.value[index],
      price,
      currency,
      isListed: true
    };
  }
}

function handleFilterChange(filters: any) {
  console.log('Filter changed:', filters);
  // In a real app, you might want to update URL parameters or fetch filtered data
}

</script>

<template>
  <div class="pb-16">
    <div class="min-h-screen bg-white dark:bg-primary-900 text-gray-900 dark:text-white">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
          <div
            class="w-16 h-16 border-4 border-t-cyan-400 border-r-purple-600 border-b-cyan-400 border-l-purple-600 rounded-full animate-spin">
          </div>
          <p class="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading the NFT collections...</p>
        </div>

        <div v-else-if="!selectedCollection"
          class="bg-white dark:bg-gradient-to-br dark:from-primary-900 dark:to-primary-800 border border-gray-200 dark:border-primary-700 rounded-lg overflow-hidden p-6 relative">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-orange-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              GAME COLLECTIONS
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="collection in nftCollections" :key="collection.id"
              @click="router.push(`/collection/${collection.id}`)"
              class="nft-card cursor-pointer relative rounded-xl overflow-hidden bg-white dark:bg-primary-800 border border-gray-200 dark:border-primary-700">
              <div class="h-40 overflow-hidden">
                <img :src="collection.logoUrl" :alt="collection.title"
                  class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
              </div>
              <div class="p-4 bg-white dark:bg-primary-800 border-t-2 border-primary-600">
                <div class="relative -mt-12 mb-2">
                  <img :src="collection.logoUrl" :alt="collection.title"
                    class="w-16 h-16 rounded-full border-4 border-white dark:border-primary-800 object-cover" />
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ collection.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">by <router-link
                    :to="`/profile/${collection.creator}`" class="text-cyan-600 dark:text-cyan-400">{{
                    collection.creator }}</router-link></p>

                <div class="mt-4 flex items-center justify-between">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Floor Price</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">{{ collection.floorPrice }} <span
                        class="text-sm text-cyan-600 dark:text-cyan-400">STEEM</span></p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Items</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">{{ collection.items }} / {{
                      collection.maxSupply }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedCollection" class="mb-16">
          <section class="relative mb-8">
            <button @click="closeCollectionDetail"
              class="absolute top-4 left-4 z-10 flex items-center px-3 py-1.5 bg-white/70 dark:bg-primary-800/70 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-primary-700 transition-colors backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            <div class="h-64 w-full rounded-t-xl overflow-hidden relative">
              <img :src="selectedCollection.logoUrl" :alt="selectedCollection.title"
                class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-gray-200/70 to-transparent dark:from-primary-900/80">
              </div>
            </div>

            <div
              class="bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-b-xl border border-purple-800/30 overflow-hidden">
              <div class="px-6 py-5 flex items-center">
                <img :src="selectedCollection.logoUrl" :alt="selectedCollection.title"
                  class="w-24 h-24 rounded-lg border-4 border-white dark:border-primary-800 bg-white dark:bg-primary-800 object-cover mr-4" />
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ selectedCollection.title }}</h1>
                  <div class="flex items-center">
                    <p class="text-gray-600 dark:text-gray-300">by <router-link
                        :to="`/profile/${selectedCollection.creator}`" class="text-cyan-600 dark:text-cyan-400">{{
                        selectedCollection.creator }}</router-link></p>
                    <div class="ml-3 px-2 py-0.5 bg-cyan-500/20 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-cyan-400 mr-1" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span class="text-xs text-cyan-400">Verified</span>
                    </div>
                  </div>
                </div>

                <div class="ml-auto flex space-x-3">
                  <a v-if="selectedCollection.links.website" :href="selectedCollection.links.website" target="_blank"
                    class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                  <a v-if="selectedCollection.links.twitter" :href="selectedCollection.links.twitter" target="_blank"
                    class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </a>
                  <a v-if="selectedCollection.links.discord" :href="selectedCollection.links.discord" target="_blank"
                    class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div class="grid grid-cols-4 border-t border-gray-200 dark:border-primary-700">
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Items</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedCollection.items }}</p>
                </div>
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Owners</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedCollection.owners }}</p>
                </div>
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Floor Price</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedCollection.floorPrice }} <span
                      class="text-sm text-cyan-600 dark:text-cyan-400">STEEM</span></p>
                </div>
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Volume</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedCollection.volume }} <span
                      class="text-sm text-cyan-600 dark:text-cyan-400">STEEM</span></p>
                </div>
              </div>
            </div>
          </section>

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-1">
              <div class="bg-gray-900/70 rounded-xl p-6 border border-purple-800/30 mb-6">
                <h2 class="text-xl font-bold text-white mb-4">About {{ selectedCollection.title }}</h2>
                <p class="text-gray-300">{{ selectedCollection.description }}</p>
              </div>

              <div class="bg-gray-900/70 rounded-xl p-6 border border-purple-800/30">
                <h2 class="text-xl font-bold text-white mb-4">Activity</h2>
                <div class="h-40 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                  <p class="text-gray-500">Price History Chart</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-center">
                  <div class="bg-gray-800/50 rounded-lg p-3">
                    <p class="text-gray-400 text-xs mb-1">24h Volume</p>
                    <p class="text-white font-bold">{{ (selectedCollection.volume * 0.05).toFixed(1) }} STEEM</p>
                  </div>
                  <div class="bg-gray-800/50 rounded-lg p-3">
                    <p class="text-gray-400 text-xs mb-1">7d Volume</p>
                    <p class="text-white font-bold">{{ (selectedCollection.volume * 0.3).toFixed(1) }} STEEM</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-3">
              <div
                class="bg-gray-900/70 rounded-xl p-4 border border-purple-800/30 mb-6 flex flex-wrap items-center justify-between">
                <div class="flex space-x-2">
                  <div class="relative">
                    <button class="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter
                    </button>
                  </div>
                  <div class="relative">
                    <button class="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center">
                      Price Range
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="flex space-x-2 mt-2 sm:mt-0">
                  <div class="relative">
                    <select
                      class="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 appearance-none pr-8">
                      <option value="recently_listed">Recently Listed</option>
                      <option value="recently_created">Recently Created</option>
                      <option value="price_low_high">Price: Low to High</option>
                      <option value="price_high_low">Price: High to Low</option>
                    </select>
                    <div class="absolute right-2 top-2.5 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex">
                    <button class="px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-l-lg text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                    <button class="px-2 py-2 bg-purple-600 text-white rounded-r-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <NFTGrid :nfts="selectedCollectionNFTs" :loading="isLoading" :show-filters="false"
                :empty-message="`No items found in ${selectedCollection.title}`" @buy="handleBuyNFT"
                @makeoffer="handleMakeOffer" @transfer="handleTransferNFT" @burn="handleBurnNFT" @list="handleListNFT"
                @filter="handleFilterChange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>