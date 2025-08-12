<script setup lang="ts">
import { ref, computed } from 'vue';
import NFTGrid from './NFTGrid.vue';

// Props and interfaces
interface NFTCollection {
  id: string;
  name: string;
  image: string;
  items: number;
}

interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  joinedDate: string;
  followers: number;
  following: number;
  links: {
    website?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface NFT {
  id: number;
  name: string;
  description: string;
  image: string;
  collection: {
    id: string;
    name: string;
  };
  owner: string;
  creator: string;
  price?: number;
  currency?: string;
  isListed: boolean;
  properties: {
    trait_type: string;
    value: string;
  }[];
  royalties: number;
  createdAt: string;
  likes: number;
  views: number;
  history: {
    id: number;
    type: 'mint' | 'transfer' | 'list' | 'sale' | 'offer' | 'burn';
    from: string;
    to?: string;
    price?: number;
    timestamp: string;
  }[];
}

const props = defineProps<{
  user: UserProfile;
  nfts: NFT[];
  collections: NFTCollection[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  follow: [username: string];
  unfollow: [username: string];
  editProfile: [];
  viewCollection: [collectionId: string];
}>();

// State
const activeTab = ref('collected'); // collected, created, collections, favorites, activity
const isFollowing = ref(false);
const selectedSort = ref('recently-added');

// Computed
const collectedNFTs = computed(() => {
  return props.nfts.filter(nft => nft.owner === props.user.username);
});

const createdNFTs = computed(() => {
  return props.nfts.filter(nft => nft.creator === props.user.username);
});

// Methods
function toggleFollow() {
  if (isFollowing.value) {
    emit('unfollow', props.user.username);
  } else {
    emit('follow', props.user.username);
  }
  isFollowing.value = !isFollowing.value;
}

function editProfile() {
  emit('editProfile');
}

function viewCollection(collectionId: string) {
  emit('viewCollection', collectionId);
}

function handleNFTAction(action: string, ...args: any[]) {
  // Just pass along any NFT actions to parent
  emit(action as any, args[0]);
}
</script>

<template>
  <div>
    <div class="w-full h-64 bg-gray-200 dark:bg-gray-800 relative">
      <img v-if="user.banner" :src="user.banner" alt="Profile banner" class="w-full h-full object-cover" />
      <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
    </div>
    
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-20 relative z-10 pb-5 border-b border-gray-200 dark:border-gray-800">
        <div class="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800">
          <img :src="user.avatar" alt="Profile avatar" class="w-full h-full object-cover" />
        </div>
        
        <div class="mt-4 md:mt-0 md:ml-6 flex-1">
          <div class="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user.displayName }}</h1>
              <p class="text-gray-500 dark:text-gray-400">@{{ user.username }}</p>
            </div>
            
            <div class="mt-4 md:mt-0 flex space-x-4">
              <button 
                @click="toggleFollow" 
                class="px-4 py-2 rounded-lg font-medium"
                :class="isFollowing 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'"
              >
                {{ isFollowing ? 'Following' : 'Follow' }}
              </button>
              <button 
                @click="editProfile" 
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium text-gray-900 dark:text-white"
              >
                Edit Profile
              </button>
            </div>
          </div>
          
          <div class="mt-4">
            <p v-if="user.bio" class="text-gray-600 dark:text-gray-300 max-w-2xl">{{ user.bio }}</p>
            
            <div class="mt-4 flex items-center space-x-6">
              <div class="flex items-center">
                <span class="font-medium text-gray-900 dark:text-white">{{ user.followers }}</span>
                <span class="ml-1 text-gray-500 dark:text-gray-400">Followers</span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-gray-900 dark:text-white">{{ user.following }}</span>
                <span class="ml-1 text-gray-500 dark:text-gray-400">Following</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 dark:text-gray-400">Joined</span>
                <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ new Date(user.joinedDate).toLocaleDateString() }}</span>
              </div>
            </div>
            
            <div v-if="user.links" class="mt-4 flex space-x-4">
              <a 
                v-if="user.links.website" 
                :href="user.links.website" 
                target="_blank" 
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd" />
                </svg>
              </a>
              <a 
                v-if="user.links.twitter" 
                :href="user.links.twitter" 
                target="_blank" 
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                v-if="user.links.instagram" 
                :href="user.links.instagram" 
                target="_blank" 
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM10 6.865a3.135 3.135 0 100 6.27 3.135 3.135 0 000-6.27zm0 5.322a2.187 2.187 0 110-4.374 2.187 2.187 0 010 4.374zm4.304-8.161a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="border-b border-gray-200 dark:border-gray-800">
        <nav class="flex -mb-px space-x-8">
          <button 
            @click="activeTab = 'collected'" 
            class="py-4 px-1 border-b-2 font-medium text-sm focus:outline-none"
            :class="activeTab === 'collected' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            Collected
          </button>
          <button 
            @click="activeTab = 'created'" 
            class="py-4 px-1 border-b-2 font-medium text-sm focus:outline-none"
            :class="activeTab === 'created' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            Created
          </button>
          <button 
            @click="activeTab = 'collections'" 
            class="py-4 px-1 border-b-2 font-medium text-sm focus:outline-none"
            :class="activeTab === 'collections' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            Collections
          </button>
          <button 
            @click="activeTab = 'favorites'" 
            class="py-4 px-1 border-b-2 font-medium text-sm focus:outline-none"
            :class="activeTab === 'favorites' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            Favorites
          </button>
          <button 
            @click="activeTab = 'activity'" 
            class="py-4 px-1 border-b-2 font-medium text-sm focus:outline-none"
            :class="activeTab === 'activity' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            Activity
          </button>
        </nav>
      </div>
      
      <div class="py-6">
        <div v-if="activeTab === 'collected'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Collected NFTs</h2>
            <div class="relative">
              <select 
                v-model="selectedSort" 
                class="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="recently-added">Recently Added</option>
                <option value="price-high-to-low">Price: High to Low</option>
                <option value="price-low-to-high">Price: Low to High</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
                </svg>
              </div>
            </div>
          </div>
          
          <NFTGrid 
            :nfts="collectedNFTs" 
            :loading="isLoading" 
            empty-message="No NFTs collected yet." 
            @buy="handleNFTAction('buy', $event)"
            @makeoffer="handleNFTAction('makeoffer', $event)"
            @transfer="handleNFTAction('transfer', $event)"
            @burn="handleNFTAction('burn', $event)"
            @list="handleNFTAction('list', $event)"
          />
        </div>
        
        <div v-if="activeTab === 'created'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Created NFTs</h2>
            <div class="relative">
              <select 
                v-model="selectedSort" 
                class="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="recently-added">Recently Added</option>
                <option value="price-high-to-low">Price: High to Low</option>
                <option value="price-low-to-high">Price: Low to High</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
                </svg>
              </div>
            </div>
          </div>
          
          <NFTGrid 
            :nfts="createdNFTs" 
            :loading="isLoading" 
            empty-message="No NFTs created yet." 
            @buy="handleNFTAction('buy', $event)"
            @makeoffer="handleNFTAction('makeoffer', $event)"
            @transfer="handleNFTAction('transfer', $event)"
            @burn="handleNFTAction('burn', $event)"
            @list="handleNFTAction('list', $event)"
          />
        </div>
        
        <div v-if="activeTab === 'collections'">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Collections</h2>
          
          <div v-if="collections.length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No collections yet</p>
          </div>
          
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="collection in collections" 
              :key="collection.id"
              @click="viewCollection(collection.id)"
              class="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-md transition cursor-pointer"
            >
              <div class="w-full h-40 bg-gray-100 dark:bg-gray-800">
                <img :src="collection.image" :alt="collection.name" class="w-full h-full object-cover" />
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ collection.name }}</h3>
                <p class="text-gray-500 dark:text-gray-400 mt-1">{{ collection.items }} items</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'favorites'">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Favorites</h2>
          
          <div class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No favorite NFTs yet</p>
          </div>
        </div>
        
        <div v-if="activeTab === 'activity'">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Activity</h2>
          
          <div class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 