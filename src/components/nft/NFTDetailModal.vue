<script setup lang="ts">
import { ref, computed } from 'vue';

// Props
import type { UINFT } from '../../types/models';

const props = defineProps<{
  nft: UINFT;
  show?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  buy: [nft: UINFT];
  makeoffer: [nft: UINFT, price: number];
  transfer: [nft: UINFT, address: string];
  burn: [nft: UINFT];
  list: [nft: UINFT, price: number, currency: string];
}>();

// State
const activeTab = ref('info'); // info, properties, history, offers
const offerPrice = ref('');
const transferAddress = ref('');
const listPrice = ref('');
const listCurrency = ref('STEEM');
const isOwner = ref(false); // For demo, in real app, check against connected wallet
const availableCurrencies = ref(['STEEM', 'SBD', 'ECH']);
const isLoading = ref(false);
const showConfirmBurn = ref(false);

// Computed
const formattedDate = computed(() => {
  if (!props.nft) return '';
  
  const date = new Date(props.nft.createdAt);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
});

// Methods
function close() {
  emit('close');
}

function makeoffer() {
  if (!props.nft || !offerPrice.value || parseFloat(offerPrice.value) <= 0) return;
  
  isLoading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    emit('makeoffer', props.nft as UINFT, parseFloat(offerPrice.value));
    offerPrice.value = '';
    isLoading.value = false;
  }, 1000);
}

function buy() {
  if (!props.nft || !props.nft.price) return;
  
  isLoading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    emit('buy', props.nft as UINFT);
    isLoading.value = false;
  }, 1000);
}

function transfer() {
  if (!props.nft || !transferAddress.value) return;
  
  isLoading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    emit('transfer', props.nft as UINFT, transferAddress.value);
    transferAddress.value = '';
    isLoading.value = false;
  }, 1000);
}

function list() {
  if (!props.nft || !listPrice.value || parseFloat(listPrice.value) <= 0) return;
  
  isLoading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    emit('list', props.nft as UINFT, parseFloat(listPrice.value), listCurrency.value);
    listPrice.value = '';
    isLoading.value = false;
  }, 1000);
}

function confirmBurn() {
  showConfirmBurn.value = true;
}

function burn() {
  if (!props.nft) return;
  
  isLoading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    emit('burn', props.nft as UINFT);
    showConfirmBurn.value = false;
    isLoading.value = false;
  }, 1000);
}

function cancelBurn() {
  showConfirmBurn.value = false;
}
</script>

<template>
  <div v-if="nft" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" @click="close"></div>

      <div class="inline-block align-bottom gaming-panel rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-cyan-500/30">
        <div class="relative">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        <div class="px-6 pt-5 pb-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center">
              <h3 class="text-2xl font-bold text-white neon-text">{{ nft.name }}</h3>
              <div class="ml-3 px-3 py-1 bg-purple-900/50 text-cyan-400 text-xs font-medium rounded-lg border border-purple-500/30">
                {{ nft.collection.name }}
              </div>
            </div>
            <button @click="close" class="text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                <img :src="nft.coverUrl" :alt="nft.name" class="w-full h-auto object-cover">
              </div>
              
              <div class="mt-4 flex justify-between items-center text-sm text-gray-400">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ nft.views }} views
                </div>
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ nft.likes }} likes
                </div>
              </div>
            </div>
            
            <div>
              <div class="border-b border-gray-700 mb-4">
                <div class="flex -mb-px">
                  <button 
                    @click="activeTab = 'info'" 
                    :class="[
                      'py-2 px-4 font-medium text-sm border-b-2 transition-colors focus:outline-none',
                      activeTab === 'info'
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    ]"
                  >
                    Info
                  </button>
                  <button 
                    @click="activeTab = 'properties'" 
                    :class="[
                      'py-2 px-4 font-medium text-sm border-b-2 transition-colors focus:outline-none',
                      activeTab === 'properties'
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    ]"
                  >
                    Properties
                  </button>
                  <button 
                    @click="activeTab = 'history'" 
                    :class="[
                      'py-2 px-4 font-medium text-sm border-b-2 transition-colors focus:outline-none',
                      activeTab === 'history'
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    ]"
                  >
                    History
                  </button>
                  <button 
                    @click="activeTab = 'offers'" 
                    :class="[
                      'py-2 px-4 font-medium text-sm border-b-2 transition-colors focus:outline-none',
                      activeTab === 'offers'
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    ]"
                  >
                    Offers
                  </button>
                </div>
              </div>
              
              <div v-if="activeTab === 'info'" class="space-y-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-400 mb-1">Description</h4>
                  <p class="text-white">{{ nft.description }}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-400 mb-1">Owner</h4>
                    <p class="text-white font-medium">{{ nft.owner }}</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-400 mb-1">Creator</h4>
                    <p class="text-white font-medium">{{ nft.creator }}</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-400 mb-1">Royalties</h4>
                    <p class="text-white font-medium">{{ nft.royalties }}%</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-400 mb-1">Created</h4>
                    <p class="text-white font-medium">{{ formattedDate }}</p>
                  </div>
                </div>
                
                <div v-if="nft.isListed" class="mt-8 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <div class="flex items-end justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-400">Current Price</h4>
                      <p class="text-2xl font-bold text-white">{{ nft.price }} <span class="text-cyan-400">{{ nft.currency }}</span></p>
                    </div>
                    <button 
                      @click="buy"
                      :disabled="isLoading"
                      class="nft-btn"
                    >
                      <span v-if="isLoading">Processing...</span>
                      <span v-else>Buy Now</span>
                    </button>
                  </div>
                </div>
                
                <div v-else-if="nft.owner === 'gamerX'" class="mt-8 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <h4 class="text-sm font-medium text-gray-400 mb-3">List for Sale</h4>
                  <div class="flex items-end space-x-4">
                    <div class="flex-1">
                      <label class="block text-sm font-medium text-gray-400 mb-1">Price</label>
                      <input 
                        v-model="listPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full py-2 px-3 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                      <select 
                        v-model="listCurrency"
                        class="py-2 px-3 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white focus:outline-none appearance-none"
                      >
                        <option v-for="currency in availableCurrencies" :key="currency" :value="currency">
                          {{ currency }}
                        </option>
                      </select>
                    </div>
                    <button 
                      @click="list"
                      :disabled="isLoading || !listPrice"
                      class="nft-btn"
                    >
                      <span v-if="isLoading">Processing...</span>
                      <span v-else>List</span>
                    </button>
                  </div>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                  <button 
                    v-if="!nft.isListed" 
                    @click="activeTab = 'offers'"
                    class="px-4 py-2 rounded-lg border border-purple-500/30 text-white hover:bg-purple-900/30 transition-colors"
                  >
                    Make Offer
                  </button>
                  
                  <button 
                    v-if="nft.owner === 'gamerX'" 
                    @click="activeTab = 'transfer'"
                    class="px-4 py-2 rounded-lg border border-purple-500/30 text-white hover:bg-purple-900/30 transition-colors"
                  >
                    Transfer
                  </button>
                  
                  <button 
                    v-if="nft.owner === 'gamerX'" 
                    @click="confirmBurn"
                    class="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    Burn NFT
                  </button>
                </div>
              </div>
              
              <div v-if="activeTab === 'properties'" class="space-y-4">
                <div v-if="nft.properties && nft.properties.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div 
                    v-for="(property, index) in nft.properties" 
                    :key="index"
                    class="bg-primary-50 dark:bg-gray-800 rounded-md p-3 text-center"
                  >
                    <p class="text-xs text-primary-600 dark:text-primary-400 uppercase">{{ property.trait_type }}</p>
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ property.value }}</p>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No properties found for this NFT</p>
                </div>
              </div>

              <div v-if="activeTab === 'history'" class="space-y-4">
                <div v-if="nft.history && nft.history.length > 0" class="space-y-3">
                  <div 
                    v-for="event in nft.history" 
                    :key="event.id"
                    class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <div class="flex items-center">
                          <span 
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                            :class="{
                              'bg-green-100 text-green-800': event.type === 'mint',
                              'bg-blue-100 text-blue-800': event.type === 'transfer',
                              'bg-yellow-100 text-yellow-800': event.type === 'list',
                              'bg-purple-100 text-purple-800': event.type === 'sale',
                              'bg-indigo-100 text-indigo-800': event.type === 'offer',
                              'bg-red-100 text-red-800': event.type === 'burn',
                            }"
                          >
                            {{ event.type }}
                          </span>
                          <span class="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            {{ new Date(event.timestamp).toLocaleString() }}
                          </span>
                        </div>
                        <div class="mt-1">
                          <template v-if="event.type === 'mint'">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                              Minted by <router-link :to="`/profile/${event.from}`" class="font-medium">{{ event.from }}</router-link>
                            </p>
                          </template>
                          <template v-else-if="event.type === 'transfer'">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                              Transferred from <router-link :to="`/profile/${event.from}`" class="font-medium">{{ event.from }}</router-link> to <router-link :to="`/profile/${event.to}`" class="font-medium">{{ event.to }}</router-link>
                            </p>
                          </template>
                          <template v-else-if="event.type === 'list'">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                              Listed by <router-link :to="`/profile/${event.from}`" class="font-medium">{{ event.from }}</router-link> for <span class="font-medium">{{ event.price }} {{ nft.currency }}</span>
                            </p>
                          </template>
                          <template v-else-if="event.type === 'sale'">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                              Sold by <router-link :to="`/profile/${event.from}`" class="font-medium">{{ event.from }}</router-link> to <router-link :to="`/profile/${event.to}`" class="font-medium">{{ event.to }}</router-link> for <span class="font-medium">{{ event.price }} {{ nft.currency }}</span>
                            </p>
                          </template>
                          <template v-else-if="event.type === 'offer'">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                              Offer made by <router-link :to="`/profile/${event.from}`" class="font-medium">{{ event.from }}</router-link> for <span class="font-medium">{{ event.price }} {{ nft.currency }}</span>
                            </p>
                          </template>
                          <template v-else-if="event.type === 'burn'">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                              Burned by <router-link :to="`/profile/${event.from}`" class="font-medium">{{ event.from }}</router-link>
                            </p>
                          </template>
                        </div>
                      </div>
                      <div v-if="event.price" class="text-right">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ event.price }} {{ nft.currency }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No transaction history found</p>
                </div>
              </div>

              <div v-if="activeTab === 'offers'" class="space-y-4">
                <div class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400">No active offers found</p>
                </div>
              </div>

              <div v-if="showConfirmBurn" class="mt-4 p-4 bg-red-900/20 border border-red-500/40 rounded-lg">
                <p class="text-white mb-4">Are you sure you want to burn this NFT? This action cannot be undone.</p>
                <div class="flex justify-end space-x-3">
                  <button 
                    @click="cancelBurn"
                    class="px-3 py-1 rounded-lg border border-gray-600 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="burn"
                    :disabled="isLoading"
                    class="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    <span v-if="isLoading">Processing...</span>
                    <span v-else>Burn NFT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 