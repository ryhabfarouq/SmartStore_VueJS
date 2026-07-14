<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FeaturesSection from '../components/FeaturesSection.vue'
import ReviewsSection from '../components/ReviewsSection.vue'
import BrandsSection from '../components/BrandsSection.vue'
import { API_BASE_URL } from '../config'

const aboutData = ref<any>(null)
const isVideoPlaying = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/about`)
    aboutData.value = await res.json()
  } catch (error) {
    console.error('Error fetching about data:', error)
  }
})
</script>

<template>
  <div class="leading-relaxed">
    <!-- Breadcrumb Section -->
    <section class="bg-gray-50 text-center py-16 mb-16 w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-medium tracking-wider mb-2 text-gray-900">ABOUT US</h1>
        <p class="text-gray-500 text-sm"><router-link to="/" class="hover:text-pink-500">Home</router-link> &gt; <span class="text-gray-400">About us</span></p>
      </div>
    </section>

    <!-- Features Section -->
    <FeaturesSection />

    <!-- Promo / Video Section -->
    <section v-if="aboutData" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
      <div class="w-full">
        <div v-if="!isVideoPlaying" class="bg-gray-200 w-full aspect-[4/3] flex justify-center items-center relative rounded overflow-hidden" :style="`background-image: url('${aboutData.promoImage}'); background-size: cover; background-position: center;`">
            <div @click="isVideoPlaying = true" class="w-16 h-16 bg-white rounded-full flex justify-center items-center shadow-lg text-gray-800 cursor-pointer hover:scale-110 hover:text-pink-500 transition-all">
                <svg class="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
        </div>
        <div v-else class="w-full aspect-[4/3] relative rounded overflow-hidden shadow-lg bg-black">
            <iframe class="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/jwmS1gc9S5A?autoplay=1&mute=1" title="Product Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
      <div>
        <h2 class="text-3xl font-normal mb-5 text-gray-900 leading-tight">{{ aboutData.title }}</h2>
        <p v-for="(paragraph, index) in aboutData.paragraphs" :key="index" class="text-gray-500 text-sm mb-5 leading-relaxed">{{ paragraph }}</p>
        <button class="bg-pink-500 text-white font-medium tracking-wide py-3 px-8 text-sm rounded shadow-sm hover:opacity-90 transition-opacity">GO TO SHOP</button>
      </div>
    </section>

    <!-- Customers Reviews Section -->
    <ReviewsSection />

    <!-- Brand Logos Section -->
    <BrandsSection />
  </div>
</template>
