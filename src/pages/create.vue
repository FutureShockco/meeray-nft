<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApiService } from '../composables/useApiService';
import { useTransactionService } from '../composables/useTransactionService';
import { useAuthStore } from 'steem-auth-vue';



// Services
const api = useApiService();
const txService = useTransactionService();
const auth = useAuthStore();

// State
const route = useRoute();
const createMode = ref((route.query.mode as string) || 'nft'); // Default create mode
const nftCollections = ref<any[]>([]);
const loading = ref(false);

// Collection creation form
const collectionForm = ref({
  symbol: '',
  name: '',
  description: '',
  maxSupply: '',
  royaltyBps: '',
  logoUrl: '',
  websiteUrl: '',
  transferable: true,
  burnable: true,
  mintable: true
});

// NFT creation form
const nftForm = ref({
  collectionSymbol: '',
  instanceId: '',
  owner: '',
  name: '',
  description: '',
  coverUrl: '',
  metadata: {}
});

// Dynamic metadata for NFT
const nftMetadata = ref([
  { trait_type: '', value: '' }
]);

// Load user's collections
onMounted(async () => {
  if (auth.state.username) {
    try {
      const collections = await api.getNftCollections({ creator: auth.state.username });
      nftCollections.value = collections?.data ?? [];
    } catch (error) {
      console.error('Failed to load collections:', error);
      nftCollections.value = [];
    }
  }
});

// Auth check
function requireAuth() {
  if (!auth.state.isAuthenticated) {
    alert('Please login to create NFTs and collections');
    return false;
  }
  return true;
}

// Collection creation handler
async function createCollection() {
  if (!requireAuth()) return;
  
  // Validate required fields
  if (!collectionForm.value.symbol || !collectionForm.value.name) {
    alert('Please fill in collection symbol and name');
    return;
  }

  // Validate symbol format (uppercase, max 10 chars)
  if (!/^[A-Z0-9]{1,10}$/.test(collectionForm.value.symbol)) {
    alert('Symbol must be uppercase letters/numbers only, max 10 characters');
    return;
  }

  try {
    loading.value = true;
    
    const collectionData: any = {
      symbol: collectionForm.value.symbol.toUpperCase(),
      name: collectionForm.value.name,
      description: collectionForm.value.description || undefined,
      maxSupply: collectionForm.value.maxSupply ? parseInt(collectionForm.value.maxSupply) : undefined,
      royaltyBps: collectionForm.value.royaltyBps ? parseInt(collectionForm.value.royaltyBps) : undefined,
      logoUrl: collectionForm.value.logoUrl || undefined,
      websiteUrl: collectionForm.value.websiteUrl || undefined,
      transferable: collectionForm.value.transferable,
      burnable: collectionForm.value.burnable,
      mintable: collectionForm.value.mintable
    };

    const result = await txService.createCollection(collectionData);
    
   
  } catch (error) {
    console.error('Failed to create collection:', error);
    alert('Failed to create collection');
  } finally {
    loading.value = false;
  }
}

// NFT creation handler
async function createNFT() {
  if (!requireAuth()) return;
  
  if (!nftForm.value.collectionSymbol) {
    alert('Please select a collection');
    return;
  }

  try {
    loading.value = true;
    
    // Build metadata object from the dynamic metadata array
    const metadata: Record<string, any> = {};
    nftMetadata.value.forEach(prop => {
      if (prop.trait_type && prop.value) {
        metadata[prop.trait_type] = prop.value;
      }
    });

    // Add name and description to metadata if provided
    if (nftForm.value.name) {
      metadata['name'] = nftForm.value.name;
    }
    if (nftForm.value.description) {
      metadata['description'] = nftForm.value.description;
    }

    // Build mint data object
    const mintData: any = {
      collectionSymbol: nftForm.value.collectionSymbol,
      owner: nftForm.value.owner || auth.state.username,
      metadata,
      coverUrl: nftForm.value.coverUrl
    };

    // Add instanceId if provided
    if (nftForm.value.instanceId) {
      mintData.instanceId = nftForm.value.instanceId;
    }

    const result = await txService.mintNFT(
      mintData.collectionSymbol,
      mintData.owner,
      mintData.metadata,
      mintData.coverUrl
    );
    

  } catch (error) {
    console.error('Failed to create NFT:', error);
    alert('Failed to create NFT');
  } finally {
    loading.value = false;
  }
}

// Add metadata to NFT
function addMetadata() {
  nftMetadata.value.push({ trait_type: '', value: '' });
}

// Remove metadata from NFT
function removeMetadata(index: number) {
  if (nftMetadata.value.length > 1) {
    nftMetadata.value.splice(index, 1);
  }
}



</script>

<template>
  <div class="pb-16">
    <div class="nft-bg-pattern min-h-screen">
      <div class="max-w-7xl mx-auto px-4 py-8">
 
        <div class="mx-auto max-w-3xl">
          <h2 class="text-2xl font-bold text-white mb-6">Create</h2>

 
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
 
            <div
              class="bg-gray-900/70 rounded-xl border border-purple-800/30 p-6 cursor-pointer hover:border-cyan-500/50 transition-all group"
              :class="{ 'border-cyan-500': createMode === 'nft' }" @click="createMode = 'nft'">
              <div class="flex items-center mb-4">
                <div
                  class="w-12 h-12 rounded-lg bg-purple-900/50 flex items-center justify-center mr-4 group-hover:bg-purple-800/80 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white">Create New NFT</h3>
              </div>
              <p class="text-gray-400 mb-4">Create a unique NFT item to sell or trade on the marketplace.</p>
            </div>

 
            <div
              class="bg-gray-900/70 rounded-xl border border-purple-800/30 p-6 cursor-pointer hover:border-cyan-500/50 transition-all group"
              :class="{ 'border-cyan-500': createMode === 'collection' }" @click="createMode = 'collection'">
              <div class="flex items-center mb-4">
                <div
                  class="w-12 h-12 rounded-lg bg-cyan-900/50 flex items-center justify-center mr-4 group-hover:bg-cyan-800/80 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white">Create Collection</h3>
              </div>
              <p class="text-gray-400 mb-4">Create a collection to group your NFTs and give them a shared brand.</p>
            </div>
          </div>

 
          <div v-if="createMode === 'nft'" class="bg-gray-900/70 rounded-xl border border-purple-800/30 p-6">
            <h3 class="text-xl font-bold text-white mb-6">Create New NFT</h3>
 
            <div class="grid grid-cols-1 gap-6">
 
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-300 mb-1">NFT Image</label>
                <div
                  class="border-2 border-dashed border-purple-800/50 hover:border-cyan-500/50 rounded-lg p-4 text-center hover:bg-gray-800/50 cursor-pointer transition">
                  <div class="space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div class="text-sm text-gray-400">
                      <label class="cursor-pointer">
                        <span>Upload an image</span>
                        <input type="file" class="hidden" accept="image/*">
                      </label>
                      <p class="mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

 
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input 
                  v-model="nftForm.name"
                  type="text" 
                  placeholder="Item name"
                  class="w-full px-4 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none">
              </div>

 
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  v-model="nftForm.description"
                  rows="3" 
                  placeholder="Provide a detailed description of your item"
                  class="w-full px-4 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"></textarea>
              </div>

 
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Collection</label>
                <select
                  v-model="nftForm.collectionSymbol"
                  class="w-full px-4 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white focus:outline-none">
                  <option value="">Select collection</option>
                  <option v-for="collection in nftCollections" :key="collection.symbol || collection.id" :value="collection.symbol || collection.id">{{
                    collection.name || collection.title }}</option>
                </select>
              </div>

 
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Instance ID (Optional)</label>
                <input 
                  v-model="nftForm.instanceId"
                  type="text" 
                  placeholder="Leave empty for auto-generated ID"
                  class="w-full px-4 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none">
                <p class="mt-1 text-xs text-gray-500">Unique identifier for this NFT within the collection</p>
              </div>

 
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Cover URL</label>
                <input 
                  v-model="nftForm.coverUrl"
                  type="url" 
                  placeholder="https://example.com/image.png"
                  class="w-full px-4 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none">
              </div>

 
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-3">Metadata</label>
                
                <div class="space-y-3">
                  <div 
                    v-for="(property, index) in nftMetadata" 
                    :key="index"
                    class="flex gap-2 items-center">
                    <input 
                      v-model="property.trait_type"
                      type="text" 
                      placeholder="Trait Type (e.g., Color)"
                      class="flex-1 rounded-lg px-4 py-2 border-2 border-purple-800/50 bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500">
                    <input 
                      v-model="property.value"
                      type="text" 
                      placeholder="Value (e.g., Blue)"
                      class="flex-1 rounded-lg px-4 py-2 border-2 border-purple-800/50 bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500">
                    <button 
                      v-if="nftMetadata.length > 1"
                      @click="removeMetadata(index)"
                      class="text-red-400 hover:text-red-300 transition-colors p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <button 
                  @click="addMetadata"
                  type="button"
                  class="mt-3 text-cyan-400 font-medium flex items-center hover:text-cyan-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Property
                </button>
              </div>



 
              <div class="pt-4">
                <button 
                  @click="createNFT"
                  :disabled="loading"
                  class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold uppercase tracking-wide hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  <span v-if="loading">Creating...</span>
                  <span v-else>Create NFT</span>
                </button>
              </div>
            </div>
          </div>

 
          <div v-else-if="createMode === 'collection'"
            class="bg-gray-900/70 rounded-xl border border-purple-800/30 p-6">
            <h3 class="text-xl font-bold text-white mb-6">Create Collection</h3>

            <div class="space-y-6">
 
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Banner Image</label>
                <div
                  class="border-2 border-dashed border-purple-800/50 hover:border-cyan-500/50 rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer transition overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="mt-1 text-sm text-gray-400">Upload Banner (1400 x 400 recommended)</p>
                </div>
              </div>

              <div class="flex gap-6 items-start">
 
                <div class="w-1/3">
                  <label class="block text-sm font-medium text-gray-300 mb-1">Logo</label>
                  <div
                    class="border-2 border-dashed border-purple-800/50 hover:border-cyan-500/50 rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-1 text-sm text-gray-400">Upload Logo (350 x 350 recommended)</p>
                  </div>
                </div>

 
                <div class="w-2/3 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input 
                      v-model="collectionForm.name"
                      type="text"
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
                      placeholder="Collection Name">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Symbol *</label>
                    <input 
                      v-model="collectionForm.symbol"
                      type="text"
                      maxlength="10"
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
                      placeholder="HEROES (max 10 chars, uppercase)"
                      @input="collectionForm.symbol = collectionForm.symbol.toUpperCase()">
                    <p class="mt-1 text-xs text-gray-500">Uppercase letters/numbers only, max 10 characters</p>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1">Max Supply</label>
                      <input 
                        v-model="collectionForm.maxSupply"
                        type="number"
                        min="1"
                        class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
                        placeholder="Leave empty for unlimited">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-1">Royalty (%)</label>
                      <input 
                        v-model="collectionForm.royaltyBps"
                        type="number"
                        min="0"
                        max="25"
                        step="0.1"
                        class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
                        placeholder="5.0">
                      <p class="mt-1 text-xs text-gray-500">Max 25%</p>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <select
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white focus:outline-none appearance-none">
                      <option value="" disabled selected>Select a category</option>
                      <option value="art">Art</option>
                      <option value="collectibles">Collectibles</option>
                      <option value="photography">Photography</option>
                      <option value="sports">Sports</option>
                      <option value="music">Music</option>
                      <option value="gaming">Gaming</option>
                      <option value="virtual-worlds">Virtual Worlds</option>
                      <option value="trading-cards">Trading Cards</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea 
                      v-model="collectionForm.description"
                      rows="3"
                      maxlength="1000"
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
                      placeholder="Describe your collection"></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Logo URL</label>
                    <input 
                      v-model="collectionForm.logoUrl"
                      type="url"
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none"
                      placeholder="https://example.com/logo.png">
                  </div>
                </div>
              </div>

 
              <div class="pt-4 border-t border-gray-800">
                <h4 class="text-lg font-medium text-white mb-3">Links</h4>

                <div class="space-y-3">
 
                  <div class="flex items-center">
                    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <input 
                      v-model="collectionForm.websiteUrl"
                      type="url" 
                      placeholder="https://yourwebsite.com"
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none" />
                  </div>

 
                  <div class="flex items-center">
                    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input type="text" placeholder="https://twitter.com/yourusername"
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none" />
                  </div>

 
                  <div class="flex items-center">
                    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <input type="text" placeholder="https://discord.gg/yourinvite"
                      class="w-full px-3 py-2 border-2 border-purple-800/50 focus:border-cyan-500 rounded-lg bg-gray-900/80 text-white placeholder-gray-500 focus:outline-none" />
                  </div>
                </div>
              </div>

 
              <div class="pt-4 border-t border-gray-800">
                <h4 class="text-lg font-medium text-white mb-3">Collection Settings</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="flex items-center">
                    <input 
                      v-model="collectionForm.transferable"
                      id="transferable"
                      type="checkbox"
                      class="w-4 h-4 text-cyan-500 bg-gray-900 border-purple-800 rounded focus:ring-cyan-500 focus:ring-2">
                    <label for="transferable" class="ml-2 text-sm text-gray-300">Transferable</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="collectionForm.burnable"
                      id="burnable"
                      type="checkbox"
                      class="w-4 h-4 text-cyan-500 bg-gray-900 border-purple-800 rounded focus:ring-cyan-500 focus:ring-2">
                    <label for="burnable" class="ml-2 text-sm text-gray-300">Burnable</label>
                  </div>
                  
                  <div class="flex items-center">
                    <input 
                      v-model="collectionForm.mintable"
                      id="mintable"
                      type="checkbox"
                      class="w-4 h-4 text-cyan-500 bg-gray-900 border-purple-800 rounded focus:ring-cyan-500 focus:ring-2">
                    <label for="mintable" class="ml-2 text-sm text-gray-300">Mintable</label>
                  </div>
                </div>
                
                <p class="mt-2 text-xs text-gray-500">
                  Configure how NFTs in this collection can be used after creation
                </p>
              </div>

 
              <div class="pt-4">
                <button 
                  @click="createCollection"
                  :disabled="loading"
                  class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold uppercase tracking-wide hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  <span v-if="loading">Creating...</span>
                  <span v-else>Create Collection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>
