<script setup lang="ts">
import { Star, Eye } from 'lucide-vue-next'

const props = defineProps<{
  product: {
    _id: string
    title: string
    name?: string
    category: {
      name: string
    } | string | any
    price: number
    discountPercentage?: number
    rating?: number
    stock?: number
    availabilityStatus?: string
    thumbnail?: string
    image?: string
    isOnSale?: boolean
    originalPrice?: number
    brand?: string
  }
}>()

// Helper to get category name
const getCategoryName = (cat: any) => {
  if (!cat) return 'General'
  if (typeof cat === 'object') return cat.name || 'General'
  return cat
}

// Helper to get product image
const getProductImage = (prod: any) => {
  return prod.thumbnail || prod.image || '/blog.png'
}

// Generate rating stars array
const getStars = (rating: number = 0) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStar
  return { fullStars, halfStar, emptyStars }
}
</script>

<template>
  <router-link 
    :to="`/products/${product._id}`" 
    class="group flex flex-col bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative cursor-pointer h-full"
  >
    <!-- Badges / Overlays -->
    <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
      <!-- Discount Badge -->
      <span 
        v-if="product.isOnSale && product.discountPercentage" 
        class="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm"
      >
        -{{ Math.round(product.discountPercentage) }}% OFF
      </span>
      
      <!-- Stock Badge -->
      <span 
        v-if="product.stock === 0" 
        class="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm"
      >
        OUT OF STOCK
      </span>
      <span 
        v-else-if="product.stock !== undefined && product.stock > 0 && product.stock <= 5" 
        class="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm"
      >
        ONLY {{ product.stock }} LEFT
      </span>
    </div>

    <!-- Product Image Container -->
    <div class="aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden relative border-b border-gray-50">
      <img 
        :src="getProductImage(product)" 
        :alt="product.title" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply"
        loading="lazy"
      />
      <!-- Hover Details Overlay Button -->
      <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span class="bg-white text-gray-900 font-medium text-xs py-2 px-4 rounded-full shadow flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <Eye class="w-3.5 h-3.5" /> Quick View
        </span>
      </div>
    </div>

    <!-- Product Details Content -->
    <div class="p-4 flex flex-col flex-grow text-left">
      <!-- Brand & Category -->
      <div class="flex justify-between items-center gap-2 mb-1.5">
        <span class="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
          {{ getCategoryName(product.category) }}
        </span>
        <span v-if="product.brand" class="text-[11px] text-gray-500 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
          {{ product.brand }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-sm font-semibold text-gray-800 group-hover:text-pink-500 transition-colors line-clamp-2 leading-tight mb-2 h-[36px]">
        {{ product.title || product.name }}
      </h3>

      <!-- Rating -->
      <div class="flex items-center gap-1 mb-3">
        <div class="flex items-center text-amber-400">
          <!-- Full Stars -->
          <Star 
            v-for="n in getStars(product.rating).fullStars" 
            :key="'f-' + n" 
            class="w-3 h-3 fill-current" 
          />
          <!-- Half Star -->
          <span v-if="getStars(product.rating).halfStar" class="relative text-amber-400">
            <Star class="w-3 h-3 fill-current clip-half" />
          </span>
          <!-- Empty Stars -->
          <Star 
            v-for="n in getStars(product.rating).emptyStars" 
            :key="'e-' + n" 
            class="w-3 h-3 text-gray-200 fill-current" 
          />
        </div>
        <span class="text-[11px] text-gray-500 font-medium">({{ product.rating?.toFixed(1) || '0.0' }})</span>
      </div>

      <!-- Pricing & Actions -->
      <div class="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
        <div class="flex items-baseline gap-1.5">
          <span class="text-base font-bold text-pink-500">
            ${{ product.price.toFixed(2) }}
          </span>
          <span 
            v-if="product.isOnSale && product.originalPrice" 
            class="text-xs text-gray-400 line-through font-normal"
          >
            ${{ product.originalPrice.toFixed(2) }}
          </span>
        </div>
        
        <!-- Action Button -->
        <span class="text-xs font-semibold text-gray-600 group-hover:text-pink-500 group-hover:underline transition-colors flex items-center gap-0.5">
          Details &rarr;
        </span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.clip-half {
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
}
</style>
