<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApiService } from '../../composables/useApiService';
import NFTGrid from '../../components/nft/NFTGrid.vue';
import type { UINFT } from '../../types/models';

const route = useRoute();
const router = useRouter();
const api = useApiService();

const collectionId = computed(() => route.params.id as string);

type GridNFT = UINFT;

const isLoading = ref(true);
const collection = ref<any | null>(null);
const nfts = ref<GridNFT[]>([]);

const fallbackLogo = '/images/placeholder-logo.jpg';
const fallbackBanner = '/images/placeholder-banner.jpg';

async function loadData() {
  try {
    isLoading.value = true;
    const symbol = collectionId.value;
    const [col, instancesResp] = await Promise.all([
      api.getNftCollection(symbol).catch(() => null),
      api.getNftInstancesByCollection(symbol, { limit: 200 }).catch(() => ({ data: [] }))
    ]);

    collection.value = col
      ? {
          id: col.symbol,
          title: col.name,
          creator: col.creator,
          logoUrl: col.logoUrl || fallbackLogo,
          coverUrl: col.coverUrl || fallbackBanner,
          floorPrice: 0,
          items: col.currentSupply || (instancesResp.data?.length || 0),
          maxSupply: col.maxSupply === 9007199254740991 ? "∞" : col.maxSupply || (instancesResp.data?.length || 0),
          description: col.description || '',
          owners: 0,
          volume: 0,
          links: {
            website: col.websiteUrl || '',
            twitter: '',
            discord: ''
          }
        }
      : null;

    const creatorName = col?.creator || '';
    const collectionTitle = col?.name || symbol;

    nfts.value = (instancesResp.data || []).map((inst: any) => {
      const traits: Array<{ trait_type: string; value: string }> = [];
      if (inst?.metadata && typeof inst.metadata === 'object') {
        for (const key of Object.keys(inst.metadata)) {
          const value = inst.metadata[key];
          if (['string', 'number', 'boolean'].includes(typeof value)) {
            traits.push({ trait_type: key, value: String(value) });
          }
        }
      }

      return {
        id: inst.tokenId || inst.instanceId || inst._id || '',
        name: `${collectionTitle} #${inst.tokenId || inst.instanceId}`,
        description: '',
        image: fallbackLogo,
        coverUrl: inst.coverUrl || fallbackLogo,
        collection: { id: symbol, name: collectionTitle },
        owner: inst.owner || '',
        creator: creatorName,
        price: undefined,
        currency: undefined,
        isListed: false,
        metadata: traits,
        royalties: 0,
        createdAt: inst.createdAt || new Date().toISOString(),
        likes: 0,
        views: 0,
        history: []
      } as GridNFT;
    });
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.push('/collections');
}

onMounted(loadData);
</script>

<template>
  <div class="pb-16">
    <div class="nft-bg-pattern min-h-screen">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 border-4 border-t-cyan-400 border-r-purple-600 border-b-cyan-400 border-l-purple-600 rounded-full animate-spin" />
          <p class="mt-4 text-gray-400 text-lg">Loading collection...</p>
        </div>

        <div v-else-if="!collection" class="text-center py-20">
          <p class="text-gray-300">Collection not found.</p>
          <button @click="goBack" class="mt-4 nft-btn">Back to Collections</button>
        </div>

        <div v-else>
          <section class="relative mb-8">
            <button @click="goBack"
              class="absolute top-4 left-4 z-10 flex items-center px-3 py-1.5 bg-gray-900/70 rounded-lg text-gray-100 hover:bg-gray-800 transition-colors backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            <div class="h-64 w-full rounded-t-xl overflow-hidden relative">
              <img :src="collection.logoUrl" :alt="collection.title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
            </div>

            <div class="bg-gray-900/80 backdrop-blur-sm rounded-b-xl border border-purple-800/30 overflow-hidden">
              <div class="px-6 py-5 flex items-center">
                <img :src="collection.logoUrl" :alt="collection.title"
                  class="w-24 h-24 rounded-lg border-4 border-gray-900 bg-gray-900 object-cover mr-4" />
                <div>
                  <h1 class="text-3xl font-bold text-white mb-1">{{ collection.title }}</h1>
                  <div class="flex items-center">
                    <p class="text-gray-300">by <span class="text-cyan-400">{{ collection.creator }}</span></p>
                    <div class="ml-3 px-2 py-0.5 bg-cyan-500/20 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-cyan-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span class="text-xs text-cyan-400">Verified</span>
                    </div>
                  </div>
                </div>

                <div class="ml-auto flex space-x-3">
                  <a v-if="collection.links.website" :href="collection.links.website" target="_blank"
                    class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                </div>
              </div>

              <div class="grid grid-cols-4 border-t border-gray-800">
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-400 mb-1">Items</p>
                  <p class="text-2xl font-bold text-white">{{ collection.items }} / {{ collection.maxSupply }}</p>
                </div>
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-400 mb-1">Owners</p>
                  <p class="text-2xl font-bold text-white">{{ collection.owners }}</p>
                </div>
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-400 mb-1">Floor Price</p>
                  <p class="text-2xl font-bold text-white">{{ collection.floorPrice }} <span class="text-sm text-cyan-400">STEEM</span></p>
                </div>
                <div class="p-4 text-center">
                  <p class="text-sm text-gray-400 mb-1">Volume</p>
                  <p class="text-2xl font-bold text-white">{{ collection.volume }} <span class="text-sm text-cyan-400">STEEM</span></p>
                </div>
              </div>
            </div>
          </section>

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-1">
              <div class="bg-gray-900/70 rounded-xl p-6 border border-purple-800/30 mb-6">
                <h2 class="text-xl font-bold text-white mb-4">About {{ collection.title }}</h2>
                <p class="text-gray-300">{{ collection.description }}</p>
              </div>
            </div>

            <div class="lg:col-span-3">
              <NFTGrid
                :nfts="nfts"
                :loading="isLoading"
                :show-filters="false"
                :empty-message="`No items found in ${collection.title}`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


