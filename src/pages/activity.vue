<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApiService } from '../composables/useApiService'

const api = useApiService()

// State
const activities = ref<any[]>([])
const loading = ref(true)
const filter = ref('all')
const filters = [
  { value: 'all', label: 'All Activity' },
  { value: 'sales', label: 'Sales' },
  { value: 'listings', label: 'Listings' },
  { value: 'bids', label: 'Bids' },
  { value: 'transfers', label: 'Transfers' },
  { value: 'mints', label: 'Mints' }
]

// Load activity data
onMounted(async () => {
  try {
    loading.value = true
    // Approximate activity from latest listings (placeholder until dedicated activity API exists)
    const listings = await api.getNftMarketListings({ limit: 100, sortBy: 'listedAt', sortDirection: 'DESC' })
    activities.value = (listings?.data || []).map((l: any) => ({
      id: `${l.collectionSymbol}-${l.instanceId}-${l.listedAt}`,
      type: 'listing',
      nftId: l.instanceId,
      nftName: l.name || `${l.collectionSymbol} #${l.instanceId}`,
      nftImage: l.image || l.uri,
      collection: l.collectionSymbol,
      collectionName: l.collectionSymbol,
      actor: l.seller,
      price: l.price,
      token: l.paymentTokenSymbol,
      timestamp: l.listedAt
    }))
  } catch (err) {
    console.error('Failed to load activity:', err)
  } finally {
    loading.value = false
  }
})

// Filter activities
const filteredActivities = computed(() => {
  if (filter.value === 'all') return activities.value
  return activities.value.filter(activity => activity.type === filter.value)
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
          <button
            v-for="filterOption in filters"
            :key="filterOption.value"
            @click="filter = filterOption.value"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all',
              filter === filterOption.value
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            ]"
          >
            {{ filterOption.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="steem-auth-spinner"></div>
      </div>

      <div v-else-if="filteredActivities.length" class="space-y-4">
        <div 
          v-for="activity in filteredActivities" 
          :key="activity.id"
          class="nft-panel hover:transform hover:scale-[1.01] transition-all cursor-pointer"
          @click="$router.push(`/nft/${activity.collection}/${activity.nftId}`)"
        >
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                :src="activity.nftImage || '/images/nfts/01.png'" 
                :alt="activity.nftName"
                class="w-full h-full object-cover"
              >
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-lg">{{ getActivityIcon(activity.type) }}</span>
                <span class="font-semibold text-white">{{ activity.nftName }}</span>
                <span class="text-gray-400">in</span>
                <router-link 
                  :to="`/collections/${activity.collection}`"
                  class="text-cyan-400 hover:text-cyan-300 font-medium"
                  @click.stop
                >
                  {{ activity.collectionName }}
                </router-link>
              </div>
              
              <div class="flex items-center space-x-4 text-sm text-gray-400">
                <span :class="getActivityColor(activity.type)" class="capitalize font-medium">
                  {{ activity.type }}
                </span>
                <span>by 
                  <router-link 
                    :to="`/profile/${activity.actor}`"
                    class="text-cyan-400 hover:text-cyan-300"
                    @click.stop
                  >
                    {{ activity.actor }}
                  </router-link>
                </span>
                <span>{{ timeAgo(activity.timestamp) }}</span>
              </div>
            </div>

            <div v-if="activity.price" class="text-right flex-shrink-0">
              <div class="font-bold text-white">{{ activity.price }} {{ activity.token || 'STEEM' }}</div>
              <div v-if="activity.usdValue" class="text-sm text-gray-400">${{ activity.usdValue }}</div>
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
