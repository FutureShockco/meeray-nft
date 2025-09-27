<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiService } from '../../../composables/useApiService'
import { useTransactionService } from '../../../composables/useTransactionService'
import { useTokenFormatting } from '../../../composables/useTokenFormatting'
import { useAuthStore } from 'steem-auth-vue'
import { useTokenListStore } from '../../../stores/useTokenList'

const route = useRoute()
const router = useRouter()
const api = useApiService()
const txService = useTransactionService()
const tokenFormatting = useTokenFormatting()
const auth = useAuthStore()
const useTokenList = useTokenListStore()

// Route params using bracket notation (Nuxt 3 format)
const collection = route.params.collection as string
const nftId = Number(route.params.id) as number

// State
const nft = ref<any>(null)
const collectionData = ref<any>(null)
const loading = ref(true)
const error = ref('')
const showBidModal = ref(false)
const showOfferModal = ref(false)
const showTransferModal = ref(false)
const showListModal = ref(false)
const bidAmount = ref('')
const transferTo = ref('')
const activeTab = ref('details')
// Map tokenList to only symbol and decimals (precision)
const tokenOptions = computed(() =>
  (useTokenList.tokens || []).map(token => ({
    symbol: token.symbol,
    decimals: token.precision
  }))
)

// Listing form data
const listingForm = ref({
  price: '',
  paymentToken: 'STEEM',
  listingType: 'FIXED_PRICE' as 'FIXED_PRICE' | 'AUCTION' | 'RESERVE_AUCTION',
  auctionEndTime: '',
  reservePrice: '',
  allowBuyNow: true,
  minimumBidIncrement: '0.1'
})

// Pre-load token details when modal opens or payment token changes
const preloadTokenDetails = async (tokenSymbol: string) => {
  if (!tokenSymbol) return

  console.log(`[preloadTokenDetails] Pre-loading details for token: ${tokenSymbol}`)
  try {
    // This will cache the token details including issuer
    await tokenFormatting.getTokenIssuer(tokenSymbol)
    console.log(`[preloadTokenDetails] Successfully pre-loaded details for: ${tokenSymbol}`)
  } catch (error) {
    console.warn(`[preloadTokenDetails] Failed to pre-load details for ${tokenSymbol}:`, error)
  }
}

// Watch for modal opening and pre-load default payment token
watch(showListModal, async (isOpen) => {
  if (isOpen) {
    console.log(`[watch] List modal opened, pre-loading token details`)
    await preloadTokenDetails(listingForm.value.paymentToken)
  }
})

// Watch for payment token changes and pre-load new token details
watch(() => listingForm.value.paymentToken, async (newToken) => {
  if (newToken) {
    console.log(`[watch] Payment token changed to: ${newToken}`)
    await preloadTokenDetails(newToken)
  }
})

// Load NFT data
onMounted(async () => {
  try {
    loading.value = true
    const [nftData, collectionInfo] = await Promise.all([
      api.getNftInstance(`${collection}_${nftId}`), // Using getNftInstance with proper ID format
      api.getNftCollection(collection),
    ])
    nft.value = nftData
    collectionData.value = collectionInfo
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load NFT'
  } finally {
    loading.value = false
  }
})

// Computed properties
const isOwner = computed(() => auth.state.username === nft.value?.owner)
const canBuy = computed(() => nft.value?.isListed && !isOwner.value && auth.state.isAuthenticated)
const canBid = computed(() => nft.value?.auction && !isOwner.value && auth.state.isAuthenticated)

// Transaction handlers
const buyNFT = async () => {
  if (!nft.value?.listingId) return

  try {
    // Format buy amount as BigInt string
    const formattedBuyAmount = await tokenFormatting.formatAmountForApi(
      nft.value.price?.toString() || '0',
      nft.value.paymentToken || 'STEEM'
    )

    const result = await txService.buyNFT({
      listingId: nft.value.listingId,
      bidAmount: formattedBuyAmount
    })


  } catch (err) {
    console.error('Failed to buy NFT:', err)
  }
}

const placeBid = async () => {
  if (!bidAmount.value || !nft.value?.listingId) return

  try {
    // Format bid amount as BigInt string
    const formattedBidAmount = await tokenFormatting.formatAmountForApi(
      bidAmount.value,
      nft.value.paymentToken || 'STEEM'
    )

    const result = await txService.buyNFT({
      listingId: nft.value.listingId,
      bidAmount: formattedBidAmount
    })


  } catch (err) {
    console.error('Failed to place bid:', err)
  }
}

const transferNFT = async () => {
  if (!transferTo.value) return

  try {
    const result = await txService.transferNFT(collection, nftId, transferTo.value)


  } catch (err) {
    console.error('Failed to transfer NFT:', err)
  }
}

const listNFT = async () => {
  if (!listingForm.value.price) return

  try {
    // Format amounts as BigInt strings
    const formattedPrice = await tokenFormatting.formatAmountForApi(
      listingForm.value.price,
      listingForm.value.paymentToken
    )

    // Get token issuer for non-native tokens
    console.log(`[listNFT] Getting issuer for payment token: ${listingForm.value.paymentToken}`)
    const tokenIssuer = await tokenFormatting.getTokenIssuer(listingForm.value.paymentToken)
    console.log(`[listNFT] Token issuer result: ${tokenIssuer}`)

    const listingData: any = {
      collectionSymbol: collection,
      instanceId: nftId,
      price: formattedPrice,
      paymentToken: listingForm.value.paymentToken,
      listingType: listingForm.value.listingType
    }

    // Add paymentTokenIssuer if token has an issuer (non-native token)
    if (tokenIssuer) {
      console.log(`[listNFT] Adding paymentTokenIssuer: ${tokenIssuer}`)
      listingData.paymentTokenIssuer = tokenIssuer
    } else {
      console.log(`[listNFT] No issuer found for ${listingForm.value.paymentToken}, not adding paymentTokenIssuer`)
    }

    console.log(`[listNFT] Final listing data:`, listingData)

    // Add auction-specific fields
    if (listingForm.value.listingType === 'AUCTION' || listingForm.value.listingType === 'RESERVE_AUCTION') {
      listingData.auctionEndTime = listingForm.value.auctionEndTime

      // Format minimum bid increment as BigInt string
      if (listingForm.value.minimumBidIncrement) {
        listingData.minimumBidIncrement = await tokenFormatting.formatAmountForApi(
          listingForm.value.minimumBidIncrement,
          listingForm.value.paymentToken
        )
      }

      // Format reserve price as BigInt string
      if (listingForm.value.listingType === 'RESERVE_AUCTION' && listingForm.value.reservePrice) {
        listingData.reservePrice = await tokenFormatting.formatAmountForApi(
          listingForm.value.reservePrice,
          listingForm.value.paymentToken
        )
      }

      listingData.allowBuyNow = listingForm.value.allowBuyNow
    }
    console.log(`[listNFT] Final listing data before submission:`, listingData)
    const result = await txService.listNFT(listingData)


  } catch (err) {
    console.error('Failed to list NFT:', err)
  }
}

const delistNFT = async () => {
  if (!nft.value?.listingId) return

  try {
    const result = await txService.delistNFT(nft.value.listingId)


  } catch (err) {
    console.error('Failed to delist NFT:', err)
  }
}
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="steem-auth-spinner"></div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <div class="nft-panel p-8">
          <h2 class="text-2xl font-bold text-red-400 mb-4">Error Loading NFT</h2>
          <p class="text-gray-300">{{ error }}</p>
          <button @click="router.back()" class="nft-btn mt-4">Go Back</button>
        </div>
      </div>


      <div v-else-if="nft" class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div class="space-y-6">

          <div class="nft-panel p-0 overflow-hidden">
            <img :src="nft.coverUrl || '/images/nfts/01.png'" :alt="nft.name" class="w-full aspect-square object-cover">
          </div>


          <div class="nft-panel">
            <h3 class="text-lg font-bold text-white mb-4">Metadata</h3>
            <div v-if="nft.metadata && nft.metadata" class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div v-for="(value, key) in nft.metadata" :key="key"
                class="bg-gray-800 rounded-lg p-3 text-center">
                <div class="text-sm font-semibold text-white">{{ key }}</div>
                <div class="text-sm font-semibold text-white">{{ value }}</div>
              </div>
            </div>
            <div v-else class="text-gray-400">No metadata defined</div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="flex items-center space-x-3 text-gray-300">
            <router-link :to="`/collection/${collection}`" class="text-cyan-400 hover:text-cyan-300">
              {{ collectionData?.name || collection }}
            </router-link>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ nft.name || `${collection} #${nftId}` }}</h1>
            <div class="flex items-center space-x-4 text-gray-300">
              <span>Owned by
                <router-link :to="`/profile/${nft.owner}`" class="text-cyan-400 hover:text-cyan-300">
                  {{ nft.owner }}
                </router-link>
              </span>
              <span>•</span>
              <span>Created by
                <router-link :to="`/profile/${nft.creator}`" class="text-cyan-400 hover:text-cyan-300">
                  {{ nft.creator }}
                </router-link>
              </span>
            </div>
          </div>



          <div class="nft-panel">
            <template v-if="nft.listing">
              <div class="mb-6">
                <div class="text-sm text-gray-400 mb-2">Listing Type</div>
                <div class="text-lg font-semibold text-white mb-2">
                  {{ nft.listing.listingType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                </div>
                <div class="text-sm text-gray-400 mb-2">Price</div>
                <div class="text-3xl font-bold text-white mb-2">
                  {{ Number(nft.listing.price) / Math.pow(10, (tokenOptions.find(t => t.symbol === nft.listing.paymentToken)?.decimals || 3)) }}
                  {{ nft.listing.paymentToken }}
                </div>
                <div v-if="nft.listing.listingType === 'RESERVE_AUCTION' && nft.listing.reservePrice" class="mb-2">
                  <div class="text-sm text-gray-400">Reserve Price</div>
                  <div class="text-white">
                    {{ Number(nft.listing.reservePrice) / Math.pow(10, (tokenOptions.find(t => t.symbol === nft.listing.paymentToken)?.decimals || 3)) }}
                    {{ nft.listing.paymentToken }}
                  </div>
                </div>
                <div v-if="nft.listing.listingType === 'AUCTION' || nft.listing.listingType === 'RESERVE_AUCTION'">
                  <div class="text-sm text-gray-400">Auction End Time</div>
                  <div class="text-white mb-2">{{ nft.listing.auctionEndTime ? new Date(nft.listing.auctionEndTime).toLocaleString() : 'N/A' }}</div>
                  <div class="text-sm text-gray-400">Minimum Bid Increment</div>
                  <div class="text-white mb-2">
                    {{ Number(nft.listing.minimumBidIncrement) / Math.pow(10, (tokenOptions.find(t => t.symbol === nft.listing.paymentToken)?.decimals || 3)) }}
                    {{ nft.listing.paymentToken }}
                  </div>
                  <div class="text-sm text-gray-400">Allow Buy Now</div>
                  <div class="text-white mb-2">{{ nft.listing.allowBuyNow ? 'Yes' : 'No' }}</div>
                </div>
                <div v-if="nft.listing.listingType === 'AUCTION' || nft.listing.listingType === 'RESERVE_AUCTION'">
                  <div class="text-sm text-gray-400">Current Highest Bid</div>
                  <div class="text-white mb-2">
                    <template v-if="nft.listing.currentHighestBid">
                      {{ Number(nft.listing.currentHighestBid) / Math.pow(10, (tokenOptions.find(t => t.symbol === nft.listing.paymentToken)?.decimals || 3)) }}
                      {{ nft.listing.paymentToken }}
                    </template>
                    <template v-else>
                      No bids yet
                    </template>
                  </div>
                  <div class="text-sm text-gray-400">Total Bids</div>
                  <div class="text-white mb-2">{{ nft.listing.totalBids }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="mb-6 text-gray-400">Not listed for sale</div>
            </template>

            <div class="space-y-3">
              <button v-if="canBuy" @click="buyNFT" class="nft-btn w-full py-4 text-lg">
                Buy for {{ nft.listing ? (Number(nft.listing.price) / Math.pow(10, (tokenOptions.find(t => t.symbol === nft.listing.paymentToken)?.decimals || 3))) : '' }} {{ nft.listing?.paymentToken || '' }}
              </button>

              <button v-if="canBid" @click="showBidModal = true" class="nft-btn w-full py-4 text-lg bg-purple-600">
                Place Bid
              </button>

              <div v-if="isOwner" class="space-y-3">
                <button v-if="!nft.listing" @click="showListModal = true" class="nft-btn w-full py-3">
                  List for Sale
                </button>

                <button v-if="nft.listing" @click="delistNFT" class="nft-btn w-full py-3 bg-red-600">
                  Remove from Sale
                </button>

                <button @click="showTransferModal = true" class="nft-btn w-full py-3 bg-gray-600">
                  Transfer
                </button>
              </div>

              <button v-if="!isOwner && auth.state.isAuthenticated" @click="showOfferModal = true"
                class="nft-btn w-full py-3 bg-gray-600">
                Make Offer
              </button>
            </div>
          </div>


          <div class="nft-panel">
            <div class="flex border-b border-gray-700 mb-4">
              <button v-for="tab in ['details', 'history', 'offers']" :key="tab" @click="activeTab = tab" :class="[
                'px-4 py-2 font-medium capitalize transition-colors',
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              ]">
                {{ tab }}
              </button>
            </div>


            <div class="space-y-4">

              <div v-if="activeTab === 'details'">
                <p v-if="nft.description" class="text-gray-300 mb-4">{{ nft.description }}</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Token ID</span>
                    <span class="text-white">{{ nftId }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Instance ID</span>
                    <span class="text-white">{{ nft.instanceId || nftId }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Collection</span>
                    <span class="text-white">{{ collectionData?.name || collection }}</span>
                  </div>
                  <div v-if="nft.royalties" class="flex justify-between">
                    <span class="text-gray-400">Creator Royalties</span>
                    <span class="text-white">{{ nft.royalties }}%</span>
                  </div>
                </div>
              </div>


              <div v-if="activeTab === 'history'">
                <div v-if="nft.history?.length" class="space-y-3">
                  <div v-for="event in nft.history" :key="event.id"
                    class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <div class="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <div>
                        <div class="text-white font-medium capitalize">{{ event.type }}</div>
                        <div class="text-xs text-gray-400">{{ new Date(event.timestamp).toLocaleDateString() }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div v-if="event.price" class="text-white">{{ event.price }} STEEM</div>
                      <div class="text-xs text-gray-400">{{ event.from }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-gray-400">No transaction history available</div>
              </div>


              <div v-if="activeTab === 'offers'">
                <div class="text-gray-400">No offers available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div v-if="showBidModal" class="steem-auth-modal-overlay" @click="showBidModal = false">
      <div class="steem-auth-modal-content" @click.stop>
        <div class="steem-auth-modal-header">
          <h2>Place a Bid</h2>
          <button @click="showBidModal = false" class="steem-auth-close-button">&times;</button>
        </div>
        <div class="steem-auth-modal-body">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Bid Amount</label>
              <input v-model="bidAmount" type="number" step="0.001" class="steem-auth-input"
                placeholder="Enter bid amount">
            </div>
            <div class="flex space-x-3">
              <button @click="placeBid" class="nft-btn flex-1">Place Bid</button>
              <button @click="showBidModal = false" class="steem-auth-button cancel flex-1">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div v-if="showTransferModal" class="steem-auth-modal-overlay" @click="showTransferModal = false">
      <div class="steem-auth-modal-content" @click.stop>
        <div class="steem-auth-modal-header">
          <h2>Transfer NFT</h2>
          <button @click="showTransferModal = false" class="steem-auth-close-button">&times;</button>
        </div>
        <div class="steem-auth-modal-body">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Transfer To</label>
              <input v-model="transferTo" type="text" class="steem-auth-input" placeholder="Enter username">
            </div>
            <div class="flex space-x-3">
              <button @click="transferNFT" class="nft-btn flex-1">Transfer</button>
              <button @click="showTransferModal = false" class="steem-auth-button cancel flex-1">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div v-if="showListModal" class="steem-auth-modal-overlay" @click="showListModal = false">
      <div class="steem-auth-modal-content max-w-lg" @click.stop>
        <div class="steem-auth-modal-header">
          <h2>List NFT for Sale</h2>
          <button @click="showListModal = false" class="steem-auth-close-button">&times;</button>
        </div>
        <div class="steem-auth-modal-body">
          <div class="space-y-6">

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-3">Listing Type</label>
              <div class="grid grid-cols-1 gap-3">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input v-model="listingForm.listingType" value="FIXED_PRICE" type="radio" class="text-cyan-500">
                  <div>
                    <div class="font-medium text-white">Fixed Price</div>
                    <div class="text-sm text-gray-400">Sell at a fixed price immediately</div>
                  </div>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input v-model="listingForm.listingType" value="AUCTION" type="radio" class="text-cyan-500">
                  <div>
                    <div class="font-medium text-white">Auction</div>
                    <div class="text-sm text-gray-400">Let buyers bid on your NFT</div>
                  </div>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input v-model="listingForm.listingType" value="RESERVE_AUCTION" type="radio" class="text-cyan-500">
                  <div>
                    <div class="font-medium text-white">Reserve Auction</div>
                    <div class="text-sm text-gray-400">Auction with minimum price guarantee</div>
                  </div>
                </label>
              </div>
            </div>


            <div v-if="listingForm.listingType === 'FIXED_PRICE'">
              <label class="block text-sm font-medium text-gray-300 mb-2">Sale Price</label>
              <div class="flex space-x-3">
                <input v-model="listingForm.price" type="number" step="0.001" placeholder="0.00"
                  class=" steem-auth-input w-16">
                <select v-model="listingForm.paymentToken" class="steem-auth-input w-16">
                  <option v-for="token in tokenOptions" :key="token.symbol" :value="token.symbol">
                    {{ token.symbol }}
                  </option>
                </select>
              </div>
            </div>


            <div v-if="listingForm.listingType === 'AUCTION' || listingForm.listingType === 'RESERVE_AUCTION'">

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  {{ listingForm.listingType === 'AUCTION' ? 'Starting Price' : 'Starting Bid' }}
                </label>
                <div class="flex space-x-3">
                  <input v-model="listingForm.price" type="number" step="0.001" placeholder="0.00"
                    class="steem-auth-input w-16">
                  <select v-model="listingForm.paymentToken" class="steem-auth-input w-16">
                    <option v-for="token in tokenOptions" :key="token.symbol" :value="token.symbol">
                      {{ token.symbol }}
                    </option>
                  </select>
                </div>
              </div>


              <div v-if="listingForm.listingType === 'RESERVE_AUCTION'">
                <label class="block text-sm font-medium text-gray-300 mb-2">Reserve Price</label>
                <input v-model="listingForm.reservePrice" type="number" step="0.001"
                  placeholder="Minimum price to accept" class="w-full steem-auth-input">
              </div>


              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Auction End Time</label>
                <input v-model="listingForm.auctionEndTime" type="datetime-local" class="w-full steem-auth-input">
              </div>


              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Minimum Bid Increment</label>
                <input v-model="listingForm.minimumBidIncrement" type="number" step="0.001" placeholder="0.1"
                  class="w-full steem-auth-input">
              </div>


              <div class="flex items-center space-x-3">
                <input v-model="listingForm.allowBuyNow" type="checkbox" class="text-cyan-500">
                <label class="text-gray-300">Allow "Buy Now" option</label>
              </div>
            </div>


            <div class="flex space-x-3 pt-4">
              <button @click="listNFT" class="nft-btn flex-1" :disabled="!listingForm.price">
                {{ listingForm.listingType === 'FIXED_PRICE' ? 'List for Sale' : 'Start Auction' }}
              </button>
              <button @click="showListModal = false" class="steem-auth-button cancel flex-1">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
