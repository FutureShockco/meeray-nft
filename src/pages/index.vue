<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApiService } from '../composables/useApiService';

const router = useRouter();
// Statistics for homepage
const stats = ref({
  totalNFTs: '50K+',
  totalUsers: '12K+',
  totalVolume: '1.2M',
  totalCollections: '500+'
});

// Featured collections data - will be loaded from API
const featuredCollections = ref([]);

// Load featured collections on mount
onMounted(async () => {
  try {
    const api = useApiService();
    const collectionsResponse = await api.getNftCollections({ limit: 3 });

    // Map API response to expected format
    featuredCollections.value = (collectionsResponse.data?.slice(0, 3) || []).map(collection => ({
      id: collection.symbol,
      title: collection.name,
      creator: collection.creator,
      logoUrl: collection.logoUrl || '/images/collections/placeholder.jpg',
      floorPrice: collection.floorPrice || 0,
      volume: collection.totalVolume || collection.volume || 0,
      items: collection.currentSupply || 0,
      maxSupply: collection.maxSupply === 9007199254740991 ? "∞" : (collection.maxSupply || 0),
      bannerImage: collection.logoUrl || '/images/collections/placeholder-banner.jpg'
    }));
  } catch (error) {
    console.error('Failed to load featured collections:', error);
  }
});

</script>

<template>
  <div class="pb-16 max-w-7xl mx-auto">
    <section class="relative overflow-hidden py-20 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900 dark:text-white">
          Discover, Create & Trade
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">NFTs</span>
          <br />
          on the Steem Blockchain
        </h1>
        <p class="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          The premier NFT marketplace where digital creativity meets blockchain technology.
          Mint, collect, and trade unique digital assets with the gaming community.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button @click="router.push('/marketplace')"
            class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            Explore Marketplace
          </button>
          <button @click="router.push('/create')"
            class="px-8 py-4 bg-gray-200 dark:bg-gray-800 border border-cyan-500/30 text-gray-900 dark:text-white font-bold rounded-xl text-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all">
            Create NFT
          </button>
        </div>
      </div>
      <div class="absolute top-20 left-10 w-20 h-20 opacity-20 rotate-12 hidden lg:block">
        <img src="/images/nfts/01.png" alt="NFT" class="w-full h-full object-cover rounded-lg" />
      </div>
      <div class="absolute top-40 right-20 w-16 h-16 opacity-30 -rotate-12 hidden lg:block">
        <img src="/images/nfts/02.png" alt="NFT" class="w-full h-full object-cover rounded-lg" />
      </div>
      <div class="absolute bottom-20 left-20 w-24 h-24 opacity-25 rotate-6 hidden lg:block">
        <img src="/images/nfts/03.png" alt="NFT" class="w-full h-full object-cover rounded-lg" />
      </div>
    </section>


    <section class="py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">{{ stats.totalNFTs }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">NFTs Created</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{{ stats.totalUsers }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{{ stats.totalVolume }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">STEEM Volume</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">{{
              stats.totalCollections }}</div>
            <div class="text-gray-600 dark:text-gray-400">Collections</div>
          </div>
        </div>
      </div>
    </section>
    <section class="py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Collections</h2>
          <p class="text-gray-600 dark:text-gray-400 text-lg">Discover the most popular NFT collections on our platform
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="collection in featuredCollections" :key="collection.id"
            @click="router.push('/collection/' + collection.id)"
            class="nft-card cursor-pointer relative rounded-xl overflow-hidden group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

            <div class="h-48 overflow-hidden">
              <img :src="collection.logoUrl" :alt="collection.title"
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
            </div>


            <div class="p-6 bg-white dark:bg-gray-900 border-t-2 border-cyan-500">
              <div class="relative -mt-12 mb-4">
                <img :src="collection.logoUrl" :alt="collection.title"
                  class="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 object-cover" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ collection.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">by <span
                  class="text-cyan-600 dark:text-cyan-400">{{ collection.creator }}</span></p>

              <div class="flex items-center justify-between">
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
        <div class="text-center mt-12">
          <button @click="router.push('/collections')"
            class="px-8 py-3 bg-gray-200 dark:bg-gray-800 border border-cyan-500/30 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-all">
            View All Collections
          </button>
        </div>
      </div>
    </section>
    <section class="py-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p class="text-gray-600 dark:text-gray-400 text-lg">Get started with NFTs in just a few simple steps</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Connect Wallet</h3>
            <p class="text-gray-600 dark:text-gray-400">Connect your Steem wallet to start trading and creating NFTs</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Create or Browse</h3>
            <p class="text-gray-600 dark:text-gray-400">Create your own NFTs or browse the marketplace for unique
              collectibles</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Trade & Earn</h3>
            <p class="text-gray-600 dark:text-gray-400">Buy, sell, and trade NFTs with other users on the marketplace
            </p>
          </div>
        </div>
      </div>
    </section>
    <section class="py-16 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <div class="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl p-12 border border-cyan-500/20">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to Start Your NFT Journey?
          </h2>
          <p class="text-gray-700 dark:text-gray-300 text-lg mb-8">Join thousands of creators and collectors on the
            premier Steem NFT
            marketplace</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="router.push('/marketplace')"
              class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              Explore Marketplace
            </button>
            <button @click="router.push('/create')"
              class="px-8 py-4 bg-transparent border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold rounded-xl text-lg hover:bg-cyan-500 hover:text-white transition-all">
              Create Your First NFT
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
