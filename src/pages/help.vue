<script setup lang="ts">
import { ref } from 'vue'

const activeSection = ref('getting-started')

const sections = [
  { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
  { id: 'buying-selling', title: 'Buying & Selling', icon: '💰' },
  { id: 'creating', title: 'Creating NFTs', icon: '✨' },
  { id: 'wallet', title: 'Wallet & Security', icon: '🔒' },
  { id: 'technical', title: 'Technical Support', icon: '🔧' },
  { id: 'contact', title: 'Contact Us', icon: '📞' }
]

const faqs = {
  'getting-started': [
    {
      question: 'What is MeeRayNFT?',
      answer: 'MeeRayNFT is a decentralized NFT marketplace built on the Steem blockchain, allowing users to create, buy, sell, and trade unique digital assets.'
    },
    {
      question: 'How do I get started?',
      answer: 'First, you need to create a Steem account and connect it to our platform. Then you can browse, buy, or create your first NFT.'
    },
    {
      question: 'What tokens can I use?',
      answer: 'You can use STEEM, SBD, MEER,and other tokens to buy and sell NFTs on our platform.'
    }
  ],
  'buying-selling': [
    {
      question: 'How do I buy an NFT?',
      answer: 'Browse the marketplace, find an NFT you like, and click "Buy Now" if it\'s listed for sale. You\'ll need sufficient tokens in your wallet.'
    },
    {
      question: 'How do I sell my NFT?',
      answer: 'Go to your profile, select the NFT you want to sell, click "List for Sale", set your price and payment token, then confirm the transaction.'
    },
    {
      question: 'What are gas fees?',
      answer: 'On the Steem blockchain, transaction fees are minimal. Most operations require only a small amount of Resource Credits.'
    }
  ],
  'creating': [
    {
      question: 'How do I create an NFT?',
      answer: 'Click "Create" in the navigation, choose "Create NFT", upload your image, fill in the details, select a collection, and mint your NFT.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support JPG, PNG, GIF, MP4, and other common image and video formats up to 100MB.'
    },
    {
      question: 'How much does it cost to create an NFT?',
      answer: 'Creating an NFT costs a small fee in STEEM to cover blockchain transaction costs.'
    }
  ]
}
</script>

<template>
  <div class="nft-bg-pattern min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-white mb-4">Help Center</h1>
        <p class="text-xl text-gray-300">Find answers to common questions and get support</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="nft-panel p-6 sticky top-8">
            <h3 class="text-lg font-bold text-white mb-4">Topics</h3>
            <nav class="space-y-2">
              <button
                v-for="section in sections"
                :key="section.id"
                @click="activeSection = section.id"
                :class="[
                  'w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all',
                  activeSection === section.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                ]"
              >
                <span>{{ section.icon }}</span>
                <span>{{ section.title }}</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-3">
          <!-- Getting Started -->
          <div v-if="activeSection === 'getting-started'" class="space-y-6">
            <div class="nft-panel">
              <h2 class="text-2xl font-bold text-white mb-6">🚀 Getting Started</h2>
              <div class="space-y-6">
                <div v-for="faq in faqs['getting-started']" :key="faq.question" class="border-b border-gray-700 pb-6 last:border-b-0 last:pb-0">
                  <h3 class="text-lg font-semibold text-white mb-3">{{ faq.question }}</h3>
                  <p class="text-gray-300">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Buying & Selling -->
          <div v-else-if="activeSection === 'buying-selling'" class="space-y-6">
            <div class="nft-panel">
              <h2 class="text-2xl font-bold text-white mb-6">💰 Buying & Selling</h2>
              <div class="space-y-6">
                <div v-for="faq in faqs['buying-selling']" :key="faq.question" class="border-b border-gray-700 pb-6 last:border-b-0 last:pb-0">
                  <h3 class="text-lg font-semibold text-white mb-3">{{ faq.question }}</h3>
                  <p class="text-gray-300">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Creating NFTs -->
          <div v-else-if="activeSection === 'creating'" class="space-y-6">
            <div class="nft-panel">
              <h2 class="text-2xl font-bold text-white mb-6">✨ Creating NFTs</h2>
              <div class="space-y-6">
                <div v-for="faq in faqs['creating']" :key="faq.question" class="border-b border-gray-700 pb-6 last:border-b-0 last:pb-0">
                  <h3 class="text-lg font-semibold text-white mb-3">{{ faq.question }}</h3>
                  <p class="text-gray-300">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Wallet & Security -->
          <div v-else-if="activeSection === 'wallet'" class="space-y-6">
            <div class="nft-panel">
              <h2 class="text-2xl font-bold text-white mb-6">🔒 Wallet & Security</h2>
              <div class="space-y-6">
                <div class="border-b border-gray-700 pb-6">
                  <h3 class="text-lg font-semibold text-white mb-3">How do I connect my wallet?</h3>
                  <p class="text-gray-300">Use the Steem Keychain browser extension to securely connect your Steem account to our platform.</p>
                </div>
                <div class="border-b border-gray-700 pb-6">
                  <h3 class="text-lg font-semibold text-white mb-3">Is my wallet secure?</h3>
                  <p class="text-gray-300">Yes, we use industry-standard security practices. Your private keys never leave your device.</p>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white mb-3">What if I lose access to my account?</h3>
                  <p class="text-gray-300">Keep your Steem account keys safe and backed up. Contact Steem support for account recovery assistance.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Technical Support -->
          <div v-else-if="activeSection === 'technical'" class="space-y-6">
            <div class="nft-panel">
              <h2 class="text-2xl font-bold text-white mb-6">🔧 Technical Support</h2>
              <div class="space-y-6">
                <div class="border-b border-gray-700 pb-6">
                  <h3 class="text-lg font-semibold text-white mb-3">Supported Browsers</h3>
                  <p class="text-gray-300">We recommend using Chrome, Firefox, Safari, or Edge with the Steem Keychain extension installed.</p>
                </div>
                <div class="border-b border-gray-700 pb-6">
                  <h3 class="text-lg font-semibold text-white mb-3">Transaction Issues</h3>
                  <p class="text-gray-300">If a transaction fails, check your account balance and try again. Transactions may take a few minutes to process.</p>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white mb-3">Image Upload Problems</h3>
                  <p class="text-gray-300">Ensure your image is under 100MB and in a supported format (JPG, PNG, GIF, MP4).</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Us -->
          <div v-else-if="activeSection === 'contact'" class="space-y-6">
            <div class="nft-panel">
              <h2 class="text-2xl font-bold text-white mb-6">📞 Contact Us</h2>
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-gray-800 p-6 rounded-lg">
                    <h3 class="text-lg font-semibold text-white mb-3">💬 Discord Community</h3>
                    <p class="text-gray-300 mb-4">Join our Discord server for real-time support and community discussions.</p>
                    <button class="nft-btn">Join Discord</button>
                  </div>
                  <div class="bg-gray-800 p-6 rounded-lg">
                    <h3 class="text-lg font-semibold text-white mb-3">📧 Email Support</h3>
                    <p class="text-gray-300 mb-4">Send us an email and we'll get back to you within 24 hours.</p>
                    <a href="mailto:support@meeraynft.com" class="nft-btn inline-block">Email Us</a>
                  </div>
                </div>
                <div class="bg-gray-800 p-6 rounded-lg">
                  <h3 class="text-lg font-semibold text-white mb-3">🐦 Follow Us</h3>
                  <p class="text-gray-300 mb-4">Stay updated with the latest news and announcements.</p>
                  <div class="flex space-x-4">
                    <button class="nft-btn">Twitter</button>
                    <button class="nft-btn bg-purple-600">Telegram</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
