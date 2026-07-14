<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from '../config'

const reviews = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews`)
    reviews.value = await res.json()
  } catch (error) {
    console.error('Error fetching reviews:', error)
  }
})
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 mb-20">
    <div class="flex items-center gap-5 mb-10">
      <h2 class="text-xl font-medium tracking-wide whitespace-nowrap text-gray-900">CUSTOMERS REVIEWS</h2>
      <div class="h-2 flex-grow bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=')] opacity-50"></div>
    </div>
    <div class="flex items-center gap-5">
      <button class="bg-white border border-gray-200 w-10 h-10 flex justify-center items-center cursor-pointer text-gray-400 hover:text-gray-800 hover:border-gray-800 transition-colors shrink-0">&lt;</button>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow">
        
        <div v-for="review in reviews" :key="review._id" class="border border-gray-200 p-8 rounded bg-white">
          <p class="text-sm text-gray-500 italic mb-5 min-h-[100px]">"{{ review.comment }}"</p>
          <div class="text-pink-500 mb-2 tracking-widest text-sm">
            <span v-for="n in review.rating" :key="n">★</span><span class="text-gray-200" v-for="n in (5 - review.rating)" :key="'empty'+n">★</span>
          </div>
          <h4 class="text-sm font-semibold text-gray-900">{{ review.name }}</h4>
        </div>
        
        <!-- Fallback if empty -->
        <div v-if="reviews.length === 0" class="col-span-3 text-center text-gray-500 py-10">
          No reviews available yet.
        </div>

      </div>
      <button class="bg-white border border-gray-200 w-10 h-10 flex justify-center items-center cursor-pointer text-gray-400 hover:text-gray-800 hover:border-gray-800 transition-colors shrink-0">&gt;</button>
    </div>
  </section>
</template>
