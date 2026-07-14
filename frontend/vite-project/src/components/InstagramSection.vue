<script setup lang="ts">
import { ref, computed } from 'vue'

const posts = ref([
  { id: 1, image: 'https://picsum.photos/seed/insta1/400/400' },
  { id: 2, image: 'https://picsum.photos/seed/insta2/400/400' },
  { id: 3, image: 'https://picsum.photos/seed/insta3/400/400' },
  { id: 4, image: 'https://picsum.photos/seed/insta4/400/400' },
  { id: 5, image: 'https://picsum.photos/seed/insta5/400/400' },
  { id: 6, image: 'https://picsum.photos/seed/insta6/400/400' },
  { id: 7, image: 'https://picsum.photos/seed/insta7/400/400' },
  { id: 8, image: 'https://picsum.photos/seed/insta8/400/400' },
])

const currentIndex = ref(0)
const itemsPerView = 5 // Adjust based on breakpoints in a real app, but 5 for md/lg is good.

const maxIndex = computed(() => Math.max(0, posts.value.length - itemsPerView))

const next = () => {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++
  } else {
    currentIndex.value = 0 // loop back
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = maxIndex.value // loop to end
  }
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 text-center mb-20 relative group">
    <h3 class="text-xl font-medium mb-8 tracking-wide text-gray-900">INSTAGRAM #SmartStore</h3>
    
    <div class="relative overflow-hidden">
      <!-- Carousel Track -->
      <div 
        class="flex transition-transform duration-500 ease-in-out gap-4"
        :style="{ transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% - ${currentIndex * 4}px))` }"
      >
        <div 
          v-for="post in posts" 
          :key="post.id" 
          class="flex-none w-[calc(50%-8px)] md:w-[calc(20%-12.8px)] relative group/item cursor-pointer overflow-hidden rounded"
        >
          <!-- Image -->
          <div 
            class="bg-gray-200 aspect-square w-full transition-transform duration-700 group-hover/item:scale-110" 
            :style="`background-image: url('${post.image}'); background-size: cover; background-position: center;`"
          ></div>
          
          <!-- Overlay on hover -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button 
        @click="prev" 
        class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-800 hover:text-pink-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      
      <button 
        @click="next" 
        class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-800 hover:text-pink-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>
  </section>
</template>
