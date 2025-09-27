<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApiService } from '../composables/useApiService'
import { useRouter, useRoute } from 'vue-router';

const api = useApiService()
const router = useRouter();
const route = useRoute();
// State
const activities = ref<any[]>([])
const loading = ref(true)
const filter = ref('all')
const filters = [
  { value: 'all', label: 'All Activity' },
  { value: 'sold', label: 'Sales' },
  { value: 'listed', label: 'Listings' },
  { value: 'bids', label: 'Bids' },
  { value: 'transfer', label: 'Transfers' },
  { value: 'mint', label: 'Mint' },
  { value: 'collection_created', label: 'Collection Created' }
]

// Load activity data
onMounted(async () => {
  try {
    loading.value = true

    // Fetch events from API
    const events = await api.getEvents({ category: 'nft', limit: 100, sortDirection: 'desc' })
    activities.value = (events?.data || [])
    console.log('Event data:', events);
    // Approximate activity from latest listings (placeholder until dedicated activity API exists)
    // const listings = await api.getNftMarketListings({ limit: 100, sortBy: 'listedAt', sortDirection: 'DESC' })
    // activities.value = (listings?.data || []).map((l: any) => ({
    //   id: `${l.collectionSymbol}-${l.instanceId}-${l.listedAt}`,
    //   type: 'listing',
    //   nftId: l.instanceId,
    //   nftName: l.name || `${l.collectionSymbol} #${l.instanceId}`,
    //   nftImage: l.image || l.uri,
    //   collection: l.collectionSymbol,
    //   collectionName: l.collectionSymbol,
    //   actor: l.seller,
    //   price: l.price,
    //   token: l.paymentToken,
    //   timestamp: l.listedAt
    // }))
  } catch (err) {
    console.error('Failed to load activity:', err)
  } finally {
    loading.value = false
  }
})

// Filter activities
const filteredActivities = computed(() => {
  if (filter.value === 'all') return activities.value
  return activities.value.filter(activity => activity.action === filter.value)
})

// Get activity icon
const getActivityIcon = (type: string) => {
  const icons = {
    sale: '💰',
    listing: '🏷️',
    bid: '📢',
    transfer: '↔️',
    mint: '✨',
    offer: '💌'
  }
  return icons[type] || '📝'
}

// Get activity color
const getActivityColor = (type: string) => {
  const colors = {
    sale: 'text-green-400',
    listing: 'text-blue-400',
    bid: 'text-yellow-400',
    transfer: 'text-purple-400',
    mint: 'text-cyan-400',
    offer: 'text-pink-400'
  }
  return colors[type] || 'text-gray-400'
}

// Format time ago
const timeAgo = (timestamp: string) => {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}


// Helper: get activity NFT image
const getActivityImage = (activity) => {
  if (activity.action === 'mint' && activity.data.coverUrl) return activity.data.coverUrl
  if (activity.action === 'listed' && activity.data.coverUrl) return activity.data.coverUrl
  if (activity.action === 'sold' && activity.data.coverUrl) return activity.data.coverUrl
  if (activity.action === 'transfer' && activity.data.coverUrl) return activity.data.coverUrl
  if (activity.action === 'collection_created' && activity.data.logoUrl) return activity.data.logoUrl
  return '/images/nfts/01.png'
}

// Helper: get activity NFT name
const getActivityName = (activity) => {
  if (activity.action === 'mint') return activity.data.properties?.name || activity.data.fullInstanceId || 'NFT Minted'
  if (activity.action === 'listed') return activity.data.fullInstanceId || 'NFT Listed'
  if (activity.action === 'sold') return activity.data.fullInstanceId || 'NFT Sold'
  if (activity.action === 'transfer') return activity.data.fullInstanceId || 'NFT Transfer'
  if (activity.action === 'collection_created') return activity.data.name || activity.data.symbol || 'Collection Created'
  return 'NFT Activity'
}

// Helper: get activity collection symbol
const getActivityCollection = (activity) => {
  if (activity.action === 'mint' || activity.action === 'listed' || activity.action === 'sold' || activity.action === 'transfer') {
    return activity.data.collectionSymbol || activity.data.collectionId
  }
  if (activity.action === 'collection_created') {
    return activity.data.symbol
  }
  return ''
}

// Helper: go to activity NFT or collection
const goToActivity = (activity) => {
  if (activity.action === 'collection_created') {
    router.push(`/collection/${activity.data.symbol}`)
  } else if (activity.data && activity.data.collectionSymbol && activity.data.instanceId) {
    router.push(`/nft/${activity.data.collectionSymbol}/${activity.data.instanceId}`)
  } else if (activity.data && activity.data.collectionSymbol && activity.data.tokenId) {
    router.push(`/nft/${activity.data.collectionSymbol}/${activity.data.tokenId}`)
  } else if (activity.data && activity.data.collectionId && activity.data.tokenId) {
    router.push(`/nft/${activity.data.collectionId}/${activity.data.tokenId}`)
  }
}

// Helper: format price from raw string
const formatPrice = (raw, symbol) => {
  if (!raw || !symbol) return ''
  // Default decimals for TESTS, MRY, SBD, STEEM
  const decimals = symbol === 'MRY' ? 8 : 3
  const num = Number(raw.replace(/^0+/, ''))
  if (isNaN(num)) return '0'
  return (num / Math.pow(10, decimals)).toLocaleString(undefined, { maximumFractionDigits: decimals })
}


</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-4">Activity</h1>
        <p class="text-gray-300">Latest marketplace activity across all collections</p>
      </div>

      <div class="nft-panel mb-8">
        <div class="flex flex-wrap gap-3">
          <button v-for="filterOption in filters" :key="filterOption.value" @click="filter = filterOption.value" :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            filter === filterOption.value
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          ]">
            {{ filterOption.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="steem-auth-spinner"></div>
      </div>

      <div v-else-if="filteredActivities.length" class="space-y-4">
        <div v-for="activity in filteredActivities" :key="activity._id"
          class="nft-panel hover:transform hover:scale-[1.01] transition-all cursor-pointer"
          @click="goToActivity(activity)">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img :src="getActivityImage(activity)" :alt="getActivityName(activity)"
                class="w-full h-full object-cover">
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-lg">{{ getActivityIcon(activity.action) }}</span>
                <span class="font-semibold text-white">{{ getActivityName(activity) }}</span>
                <span v-if="getActivityCollection(activity)" class="text-gray-400">in</span>
                <router-link v-if="getActivityCollection(activity)"
                  :to="`/collection/${getActivityCollection(activity)}`"
                  class="text-cyan-400 hover:text-cyan-300 font-medium" @click.stop>
                  {{ getActivityCollection(activity) }}
                </router-link>
              </div>

              <div class="flex items-center space-x-4 text-sm text-gray-400">
                <span :class="getActivityColor(activity.action)" class="capitalize font-medium">
                  {{ activity.action.replace('_', ' ') }}
                </span>
                <span>by
                  <router-link :to="`/profile/${activity.actor}`" class="text-cyan-400 hover:text-cyan-300" @click.stop>
                    {{ activity.actor }}
                  </router-link>
                </span>
                <span>{{ timeAgo(activity.timestamp) }}</span>
              </div>
              <div v-if="activity.action === 'listed'">
                <span class="text-sm text-gray-400">Type:</span>
                <span class="text-white">{{ activity.data.listingType?.replace('_', ' ') }}</span>
                <span class="text-sm text-gray-400 ml-4">Price:</span>
                <span class="text-white">{{ formatPrice(activity.data.price, activity.data.paymentToken) }} {{
                  activity.data.paymentToken }}</span>
              </div>
              <div v-else-if="activity.action === 'sold'">
                <span class="text-sm text-gray-400">Sold to:</span>
                <span class="text-white">{{ activity.data.buyer }}</span>
                <span class="text-sm text-gray-400 ml-4">Price:</span>
                <span class="text-white">{{ formatPrice(activity.data.finalPrice || activity.data.price,
                  activity.data.paymentToken) }} {{ activity.data.paymentToken }}</span>
              </div>
              <div v-else-if="activity.action === 'mint'">
                <span class="text-sm text-gray-400">Token:</span>
                <span class="text-white">{{ activity.data.fullInstanceId }}</span>
                <span v-if="activity.data.properties?.name || activity.data.metadata?.attributes?.rarity"
                  class="text-sm text-gray-400 ml-4">Name:</span>
                <span v-if="activity.data.properties?.name" class="text-white">{{ activity.data.properties.name
                  }}</span>
                <span v-else-if="activity.data.metadata?.attributes?.rarity" class="text-white">{{
                  activity.data.metadata.attributes.rarity }}</span>
              </div>
              <div v-else-if="activity.action === 'transfer'">
                <span class="text-sm text-gray-400">From:</span>
                <span class="text-white">{{ activity.data.from }}</span>
                <span class="text-sm text-gray-400 ml-4">To:</span>
                <span class="text-white">{{ activity.data.to }}</span>
                <span v-if="activity.data.memo" class="text-sm text-gray-400 ml-4">Memo:</span>
                <span v-if="activity.data.memo" class="text-white">{{ activity.data.memo }}</span>
              </div>
              <div v-else-if="activity.action === 'collection_created'">
                <span class="text-sm text-gray-400">Collection:</span>
                <span class="text-white">{{ activity.data.symbol }}</span>
                <span class="text-sm text-gray-400 ml-4">Name:</span>
                <span class="text-white">{{ activity.data.name }}</span>
              </div>
            </div>

            <div class="text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <div class="nft-panel p-8">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-xl font-bold text-white mb-2">No Activity Found</h3>
          <p class="text-gray-400">No marketplace activity for the selected filter.</p>
        </div>
      </div>
    </div>
  </div>
</template>
