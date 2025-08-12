<script setup lang="ts">
import { ref, computed } from 'vue';

const isOpen = ref(false);
const isLoading = ref(false);
const previewImage = ref('');
const bannerImage = ref('');
const logoFileInput = ref<HTMLInputElement | null>(null);
const bannerFileInput = ref<HTMLInputElement | null>(null);

// Form data
const collectionData = ref({
  name: '',
  description: '',
  logo: null as File | null,
  banner: null as File | null,
  category: '',
  links: {
    website: '',
    twitter: '',
    discord: ''
  }
});

// Categories
const categories = ref([
  { id: 'art', name: 'Art' },
  { id: 'collectibles', name: 'Collectibles' },
  { id: 'photography', name: 'Photography' },
  { id: 'sports', name: 'Sports' },
  { id: 'music', name: 'Music' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'virtual-worlds', name: 'Virtual Worlds' },
  { id: 'trading-cards', name: 'Trading Cards' }
]);

// Computed validation state
const isFormValid = computed(() => {
  return collectionData.value.name && 
         collectionData.value.description && 
         previewImage.value &&
         bannerImage.value &&
         collectionData.value.category;
});

// Methods
function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
  // Reset form
  collectionData.value = {
    name: '',
    description: '',
    logo: null,
    banner: null,
    category: '',
    links: {
      website: '',
      twitter: '',
      discord: ''
    }
  };
  previewImage.value = '';
  bannerImage.value = '';
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  
  const file = target.files[0];
  collectionData.value.logo = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function handleBannerUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  
  const file = target.files[0];
  collectionData.value.banner = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    bannerImage.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

async function createCollection() {
  if (!isFormValid.value) return;
  
  try {
    isLoading.value = true;
    
    // TODO: Connect to blockchain for actual collection creation
    // This is a placeholder for the actual implementation
    console.log('Creating collection with data:', collectionData.value);
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Close modal after successful creation
    close();
    
  } catch (error) {
    console.error('Error creating collection:', error);
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
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Create Collection</h3>
            <button @click="close" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <!-- Banner Image Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image</label>
              <div 
                class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                :class="{'border-primary-500': bannerImage}"
                @click="bannerFileInput?.click()"
              >
                <input 
                  ref="bannerFileInput" 
                  type="file" 
                  class="hidden" 
                  accept="image/*" 
                  @change="handleBannerUpload"
                >
                <template v-if="!bannerImage">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload Banner (1400 x 400 recommended)</p>
                </template>
                <img v-else :src="bannerImage" class="w-full h-full object-cover">
              </div>
            </div>

            <div class="flex gap-6 items-start">
              <!-- Logo Upload -->
              <div class="w-1/3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
                <div 
                  class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                  :class="{'border-primary-500': previewImage}"
                  @click="logoFileInput?.click()"
                >
                  <input 
                    ref="logoFileInput" 
                    type="file" 
                    class="hidden" 
                    accept="image/*" 
                    @change="handleLogoUpload"
                  >
                  <template v-if="!previewImage">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload Logo (350 x 350 recommended)</p>
                  </template>
                  <img v-else :src="previewImage" class="w-full h-full object-cover">
                </div>
              </div>

              <!-- Collection Info -->
              <div class="w-2/3 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input 
                    v-model="collectionData.name" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Collection Name"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    v-model="collectionData.category" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="" disabled>Select a category</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                    v-model="collectionData.description" 
                    rows="3" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Describe your collection"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Links Section -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Links</h4>
              
              <div class="space-y-3">
                <!-- Website -->
                <div class="flex items-center">
                  <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <input 
                    v-model="collectionData.links.website" 
                    type="url" 
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Website URL"
                  >
                </div>

                <!-- Twitter -->
                <div class="flex items-center">
                  <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input 
                    v-model="collectionData.links.twitter" 
                    type="url" 
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Twitter URL"
                  >
                </div>

                <!-- Discord -->
                <div class="flex items-center">
                  <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <input 
                    v-model="collectionData.links.discord" 
                    type="url" 
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Discord URL"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with actions -->
        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="createCollection" 
            :disabled="!isFormValid || isLoading" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            :class="{'opacity-50 cursor-not-allowed': !isFormValid || isLoading}"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Creating...' : 'Create Collection' }}
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