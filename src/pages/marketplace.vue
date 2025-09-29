<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { UINFT, UINFTCollection, UIUserProfile } from '../types/models';
import { useApiService } from '../composables/useApiService';
import { useTransactionService } from '../composables/useTransactionService';
import { useAuthStore } from 'steem-auth-vue';
import NFTGrid from '../components/nft/NFTGrid.vue';

const router = useRouter();

// Interface for NFT data structure
type NFT = UINFT;

// Interface for NFT collection
type NFTCollection = UINFTCollection;

// Interface for User Profile
type UserProfile = UIUserProfile;

// Carousel functionality
const activeSlide = ref(0);

function prevSlide() {
  activeSlide.value = (activeSlide.value - 1 + nftCollections.value.length) % nftCollections.value.length;
}

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % nftCollections.value.length;
}

function setActiveSlide(index: number) {
  activeSlide.value = index;
}

// Data loading states
const isLoading = ref(true);
const nftsData = ref<NFT[]>([]);
const nftCollections = ref<NFTCollection[]>([]);

// Computed properties
const marketplaceNFTs = computed(() => {
  return nftsData.value.filter(nft => nft.isListed);
});

const trendingNFTs = computed(() => {
  // Sort by views as a simple proxy for "trending"
  return [...nftsData.value].sort((a, b) => b.views - a.views).slice(0, 8);
});

// Services
const api = useApiService();
const txService = useTransactionService();
const auth = useAuthStore();

// Load marketplace data from API
onMounted(async () => {
  try {
    isLoading.value = true;

    // Load data in parallel using existing API functions
    const [nftListings, collections] = await Promise.all([
      api.getNftMarketListings({ limit: 100 }),
      api.getNftCollections({ limit: 50 })
    ]);

    console.log('Marketplace - NFT Listings:', nftListings);
    console.log('Marketplace - Collections:', collections);

    // Update NFTs data from market listings
    if (nftListings?.data && nftListings.data.length > 0) {
      nftsData.value = nftListings.data.map((listing: any) => ({
        id: listing.instanceId || listing._id,
        name: listing.name || `NFT #${listing.instanceId}`,
        description: listing.description || '',
        coverUrl: listing.coverUrl || listing.uri || '/images/nfts/01.png',
        collection: {
          id: listing.collectionSymbol,
          name: listing.collectionSymbol
        },
        owner: listing.seller,
        creator: listing.creator || '',
        price: listing.price ? parseFloat(listing.price) : undefined,
        currency: listing.paymentToken || 'STEEM',
        isListed: listing.status === 'ACTIVE',
        metadata: listing.metadata || [],
        royalties: listing.royalties || 0,
        createdAt: listing.listedAt || new Date().toISOString(),
        likes: 0,
        views: 0,
        history: []
      }));
    }

    // Update collections data
    console.log('Collections condition check:', collections?.data && collections.data.length > 0);
    console.log('Collections data length:', collections?.data?.length);

    if (collections?.data && collections.data.length > 0) {
      nftCollections.value = collections.data.map((collection: any) => ({
        id: collection.symbol,
        title: collection.name,
        creator: collection.creator,
        logoUrl: collection.logoUrl || '/images/collections/placeholder.jpg',
        floorPrice: 0, // Would need separate API call to calculate
        items: collection.currentSupply || 0,
        maxSupply: collection.maxSupply === 9007199254740991 ? "∞" : (collection.maxSupply || 0),
        bannerImage: collection.logoUrl || '/images/collections/placeholder-banner.jpg',
        description: collection.description || '',
        owners: 0, // Would need separate API call to calculate
        volume: 0, // Would need separate API call to calculate
        links: {
          website: collection.websiteUrl || '',
          twitter: '',
          discord: ''
        }
      }));

      console.log('Mapped collections:', nftCollections.value);
      console.log('Collections count:', nftCollections.value.length);
    } else {
      console.log('No collections data to map');
    }

  } catch (error) {
    console.error('Failed to load marketplace data:', error);
  } finally {
    isLoading.value = false;
  }
});

// Action handlers
async function handleBuyNFT(nft: NFT) {
  if (!auth.state.isAuthenticated) {
    alert('Please login to buy NFTs');
    return;
  }

  if (!nft.price) {
    alert('NFT is not for sale');
    return;
  }

  try {
    const result = await txService.buyNFT({
      listingId: `${nft.collection.id}-${nft.id}`, // Assuming listing ID format
      bidAmount: nft.price.toString()
    });


  } catch (error) {
    console.error('Failed to buy NFT:', error);
    alert('Failed to buy NFT');
  }
}

async function handleMakeOffer(nft: NFT, price: number) {
  if (!auth.state.isAuthenticated) {
    alert('Please login to make offers');
    return;
  }

  try {
    const result = await txService.buyNFT({
      listingId: `${nft.collection.id}-${nft.id}`,
      bidAmount: price.toString(),
      bidType: 'BID'
    });

  } catch (error) {
    console.error('Failed to make offer:', error);
    alert('Failed to make offer');
  }
}

async function handleTransferNFT(nft: NFT, address: string) {
  if (!auth.state.isAuthenticated) {
    alert('Please login to transfer NFTs');
    return;
  }

  if (nft.owner !== auth.state.username) {
    alert('You can only transfer NFTs you own');
    return;
  }

  try {
    const result = await txService.transferNFT(nft.collection.id, nft.id, address);


  } catch (error) {
    console.error('Failed to transfer NFT:', error);
    alert('Failed to transfer NFT');
  }
}

function handleBurnNFT(nft: NFT) {
  if (!auth.state.isAuthenticated) {
    alert('Please login to burn NFTs');
    return;
  }

  if (nft.owner !== auth.state.username) {
    alert('You can only burn NFTs you own');
    return;
  }

  if (confirm('Are you sure you want to burn this NFT? This action cannot be undone.')) {
    // Note: Burn functionality would need to be implemented in transaction service
    console.log('Burn NFT:', nft);
    alert('Burn functionality coming soon');
  }
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
    <div class="nft-bg-pattern min-h-screen">
      <div class="max-w-7xl mx-auto px-4 py-8">

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
          <div
            class="w-16 h-16 border-4 border-t-cyan-400 border-r-purple-600 border-b-cyan-400 border-l-purple-600 rounded-full animate-spin">
          </div>
          <p class="mt-4 text-gray-400 text-lg">Loading the NFT marketplace...</p>
        </div>


        <div v-else>

          <section class="mb-16 -mx-4 lg:-mx-8 relative">

            <div class="relative overflow-hidden">

              <div class="flex transition-transform duration-500 ease-in-out"
                :style="{ transform: `translateX(-${activeSlide * 100}%)` }">
                <div v-for="(collection, index) in nftCollections" :key="collection.id"
                  class="w-full flex-shrink-0 relative">

                  <div class="relative h-[500px]">
                    <img :src="collection.logoUrl" :alt="collection.title" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-gray-900/50"></div>
                  </div>


                  <div class="absolute inset-0 flex items-center">
                    <div class="max-w-7xl mx-auto px-4 w-full">
                      <div class="flex flex-col md:flex-row items-center md:items-start gap-8">

                        <div
                          class="w-40 h-40 rounded-xl overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/30">
                          <img :src="collection.logoUrl" :alt="collection.title" class="w-full h-full object-cover" />
                        </div>


                        <div class="text-center md:text-left max-w-lg">
                          <h2 class="text-3xl md:text-5xl font-black text-white mb-2">
                            {{ collection.title }}
                          </h2>
                          <p class="text-lg text-cyan-400 mb-2">by {{ collection.creator }}</p>
                          <p class="text-xl text-gray-300 mb-6">
                            {{ collection.description.substring(0, 120) }}...
                          </p>


                          <div class="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
                            <div class="text-center">
                              <p class="text-sm text-gray-400">Items</p>
                              <p class="text-xl font-bold text-white">{{ collection.items }} / {{ collection.maxSupply
                                }}</p>
                            </div>
                            <div class="text-center">
                              <p class="text-sm text-gray-400">Floor Price</p>
                              <p class="text-xl font-bold text-white">{{ collection.floorPrice }}
                                <span class="text-sm text-cyan-400">STEEM</span>
                              </p>
                            </div>
                            <div class="text-center">
                              <p class="text-sm text-gray-400">Volume</p>
                              <p class="text-xl font-bold text-white">{{ collection.volume }} <span
                                  class="text-sm text-cyan-400">STEEM</span></p>
                            </div>
                          </div>


                          <button @click="router.push('/collection/' + collection.id)"
                            class="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                            Explore Collection
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div class="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                <button @click="prevSlide"
                  class="w-12 h-12 rounded-full bg-gray-900/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors pointer-events-auto"
                  aria-label="Previous slide">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button @click="nextSlide"
                  class="w-12 h-12 rounded-full bg-gray-900/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-gray-900/80 transition-colors pointer-events-auto"
                  aria-label="Next slide">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>


              <div class="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
                <button v-for="(collection, index) in nftCollections" :key="`indicator-${index}`"
                  @click="setActiveSlide(index)" class="w-3 h-3 rounded-full transition-colors"
                  :class="activeSlide === index ? 'bg-cyan-500' : 'bg-gray-500/50 hover:bg-gray-400/50'"
                  :aria-label="`Go to slide ${index + 1}`"></button>
              </div>
            </div>
          </section>


          <section class="mb-16">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-cyan-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Notable Drops
              </h2>
              <router-link to="/collections" class="text-cyan-400 hover:text-cyan-300 text-sm font-medium">View
                All</router-link>
            </div>


            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="collection in nftCollections.slice(0, 3)" :key="collection.id"
                @click="router.push('/collection/' + collection.id)"
                class="nft-card cursor-pointer relative rounded-xl overflow-hidden">

                <div class="h-40 overflow-hidden">
                  <img :src="collection.logoUrl" :alt="collection.title"
                    class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
                </div>


                <div class="bg-gray-900 p-4 border-t-2 border-cyan-500">
                  <div class="relative -mt-12 mb-2">
                    <img :src="collection.logoUrl" :alt="collection.title"
                      class="w-16 h-16 rounded-full border-4 border-gray-900 object-cover" />
                  </div>
                  <h3 class="text-lg font-bold text-white">{{ collection.title }}</h3>
                  <p class="text-sm text-gray-400">by <span class="text-cyan-400">{{ collection.creator }}</span>
                  </p>

                  <div class="mt-4 flex items-center justify-between">
                    <div>
                      <p class="text-xs text-gray-500">Floor Price</p>
                      <p class="text-lg font-bold text-white">{{ collection.floorPrice }} <span
                          class="text-sm text-cyan-400">STEEM</span></p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Items</p>
                      <p class="text-lg font-bold text-white">{{ collection.items }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <section class="mb-16">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-pink-500" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                Trending
              </h2>
              <div class="flex items-center space-x-2">
                <span class="text-gray-400 text-sm">Sort by:</span>
                <select class="bg-gray-900 text-white text-sm border border-gray-700 rounded-lg px-2 py-1">
                  <option value="24h">24h</option>
                  <option value="7d">7d</option>
                  <option value="30d">30d</option>
                </select>
              </div>
            </div>

            <NFTGrid :nfts="trendingNFTs" :loading="isLoading" @buy="handleBuyNFT" @makeoffer="handleMakeOffer"
              @transfer="handleTransferNFT" @burn="handleBurnNFT" @list="handleListNFT" @filter="handleFilterChange" />
          </section>


          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-purple-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Explore All NFTs
              </h2>
            </div>
            <NFTGrid :nfts="marketplaceNFTs" :loading="isLoading" :show-filters="true"
              :empty-message="'No NFTs currently for sale'" @buy="handleBuyNFT" @makeoffer="handleMakeOffer"
              @transfer="handleTransferNFT" @burn="handleBurnNFT" @list="handleListNFT" @filter="handleFilterChange" />
          </section>
        </div>
      </div>
    </div>
  </div>
</template>