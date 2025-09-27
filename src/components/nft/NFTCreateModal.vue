<script setup lang="ts">
import { ref, computed } from 'vue';

const isOpen = ref(false);
const activeTab = ref('basic'); // basic, metadata, royalties
const isLoading = ref(false);
const previewImage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

// Form data
const nftData = ref({
  name: '',
  description: '',
  image: null as File | null,
  collection: '',
  metadata: [{ trait_type: '', value: '' }],
  royalties: 10, // Default 10%
});

// Collections the user can mint to
const userCollections = ref([
  { id: 'personal', name: 'Personal Collection' },
  { id: 'steempunks', name: 'Steem Punks' },
  { id: 'steemdoodles', name: 'SteemDoodles' },
]);

// Computed validation state
const isFormValid = computed(() => {
  return nftData.value.name && 
         nftData.value.description && 
         previewImage.value && 
         nftData.value.collection;
});

// Methods
function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
  // Reset form
  nftData.value = {
    name: '',
    description: '',
    image: null,
    collection: '',
    metadata: [{ trait_type: '', value: '' }],
    royalties: 10,
  };
  previewImage.value = '';
  activeTab.value = 'basic';
}

function addMetadata() {
  nftData.value.metadata.push({ trait_type: '', value: '' });
}

function removeMetadata(index: number) {
  nftData.value.metadata.splice(index, 1);
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  
  const file = target.files[0];
  nftData.value.image = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

async function mintNFT() {
  if (!isFormValid.value) return;
  
  try {
    isLoading.value = true;
    
    // TODO: Connect to blockchain for actual minting
    // This is a placeholder for the actual implementation
    console.log('Minting NFT with data:', nftData.value);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Close modal after successful mint
    close();
    
  } catch (error) {
    console.error('Error minting NFT:', error);
  } finally {
    isLoading.value = false;
  }
}

// Expose methods to parent components
defineExpose({
  open,
  close
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <div class="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Create New NFT</h3>
            <button @click="close" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button 
              @click="activeTab = 'basic'" 
              :class="[
                'py-2 px-4 font-medium',
                activeTab === 'basic' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
            >
              Basic Info
            </button>
            <button 
              @click="activeTab = 'metadata'" 
              :class="[
                'py-2 px-4 font-medium',
                activeTab === 'metadata' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
            >
              Metadata
            </button>
            <button 
              @click="activeTab = 'royalties'" 
              :class="[
                'py-2 px-4 font-medium',
                activeTab === 'royalties' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
            >
              Royalties
            </button>
          </div>

          <div v-if="activeTab === 'basic'" class="space-y-4">
            <div class="flex gap-6">
              <div class="w-1/3">
                <div 
                  class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                  :class="{'border-primary-500': previewImage}"
                  @click="fileInput?.click()"
                >
                  <input 
                    ref="fileInput" 
                    type="file" 
                    class="hidden" 
                    accept="image/*" 
                    @change="handleImageUpload"
                  >
                  <template v-if="!previewImage">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Upload Image</p>
                  </template>
                  <img v-else :src="previewImage" class="w-full h-full object-cover">
                </div>
              </div>

              <div class="w-2/3 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input 
                    v-model="nftData.name" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="NFT Name"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                    v-model="nftData.description" 
                    rows="3" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Describe your NFT"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection</label>
                  <select 
                    v-model="nftData.collection" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="" disabled>Select a collection</option>
                    <option v-for="collection in userCollections" :key="collection.id" :value="collection.id">
                      {{ collection.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'metadata'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">Metadata</h4>
              <button 
                @click="addMetadata" 
                class="px-3 py-1 bg-primary-50 dark:bg-gray-800 text-primary-600 rounded-md hover:bg-primary-100 dark:hover:bg-gray-700 transition"
              >
                Add Metadata
              </button>
            </div>
            
            <div v-if="nftData.metadata.length === 0" class="text-center py-4">
              <p class="text-gray-500 dark:text-gray-400">No metadata added yet</p>
            </div>

            <div v-for="(property, index) in nftData.metadata" :key="index" class="flex gap-4 items-center">
              <div class="flex-1">
                <input 
                  v-model="property.trait_type" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Property (e.g. Color)"
                >
              </div>
              <div class="flex-1">
                <input 
                  v-model="property.value" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Value (e.g. Blue)"
                >
              </div>
              <button @click="removeMetadata(index)" class="text-gray-400 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'royalties'" class="space-y-4">
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">Royalties</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Royalties let you earn a percentage of the sale price each time your NFT is sold on the marketplace.
            </p>
            
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Royalty Percentage ({{ nftData.royalties }}%)
              </label>
              <input 
                v-model="nftData.royalties" 
                type="range" 
                min="0" 
                max="25" 
                step="0.5"
                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              >
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1 mt-1">
                <span>0%</span>
                <span>25%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="mintNFT" 
            :disabled="!isFormValid || isLoading" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            :class="{'opacity-50 cursor-not-allowed': !isFormValid || isLoading}"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Creating...' : 'Create NFT' }}
          </button>
          <button 
            @click="close" 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 