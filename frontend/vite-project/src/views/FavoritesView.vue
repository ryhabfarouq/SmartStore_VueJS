<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import { Mail, Shield, User, ShoppingBag, Calendar, Loader2, AlertCircle, Trash2, ShoppingCart, Heart } from 'lucide-vue-next'
import { API_BASE_URL } from '../config'

const { user, token } = useAuth()
const { addToCart } = useCart()

const wishlist = ref<any[]>([])
const loading = ref(true)
const errorMsg = ref('')
const actionSuccessMsg = ref('')

const fetchWishlist = async () => {
  if (!token.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    if (!res.ok) {
      throw new Error('Failed to fetch wishlist')
    }
    wishlist.value = await res.json()
  } catch (err: any) {
    console.error('Error fetching wishlist:', err)
    errorMsg.value = err.message || 'Something went wrong while loading favorites.'
  } finally {
    loading.value = false
  }
}

const handleRemoveFromWishlist = async (productId: string) => {
  if (!token.value) return
  actionSuccessMsg.value = ''
  errorMsg.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    if (!res.ok) {
      throw new Error('Failed to remove item')
    }
    wishlist.value = await res.json()
    actionSuccessMsg.value = 'Item removed from favorites.'
    setTimeout(() => { actionSuccessMsg.value = '' }, 3000)
  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to remove product from favorites.'
  }
}

const handleAddToCart = (product: any) => {
  actionSuccessMsg.value = ''
  errorMsg.value = ''
  try {
    addToCart(product, 1)
    actionSuccessMsg.value = `${product.title} added to cart!`
    setTimeout(() => { actionSuccessMsg.value = '' }, 3000)
  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to add product to cart.'
  }
}

onMounted(() => {
  fetchWishlist()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
    
    <!-- Breadcrumb -->
    <div class="flex items-center text-xs text-gray-500 gap-1.5 uppercase font-medium tracking-wide mb-8">
      <router-link to="/" class="hover:text-pink-500 transition-colors">Home</router-link>
      <span>/</span>
      <router-link to="/profile" class="hover:text-pink-500 transition-colors">Portal</router-link>
      <span>/</span>
      <span class="text-gray-900 font-semibold">Favorites</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Account Info Sidebar Summary -->
      <div class="bg-white border border-gray-100 p-6 rounded-lg shadow-sm h-fit text-left">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-5 mb-5">
          <div class="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
            {{ user?.name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 leading-tight">{{ user?.name }}</h2>
            <p class="text-xs text-gray-400 font-medium tracking-wider uppercase mt-1">{{ user?.role }} Portal</p>
          </div>
        </div>

        <div class="space-y-4 text-sm">
          <div class="flex items-center gap-3 text-gray-600">
            <Mail class="w-4.5 h-4.5 text-gray-400 shrink-0" />
            <div class="truncate">
              <span class="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Email Address</span>
              <span class="font-medium text-gray-800">{{ user?.email }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3 text-gray-600">
            <Shield class="w-4.5 h-4.5 text-gray-400 shrink-0" />
            <div>
              <span class="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Account Role</span>
              <span class="font-semibold text-gray-800">{{ user?.role }}</span>
            </div>
          </div>
        </div>

        <!-- Portal Navigation -->
        <div class="border-t border-gray-100 pt-5 mt-5 space-y-2">
          <router-link to="/profile" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all hover:bg-gray-50 text-gray-700" active-class="bg-pink-500/10 text-pink-500 font-bold">
            <User class="w-4 h-4 text-gray-400" />
            <span>Profile Details</span>
          </router-link>
          <router-link to="/orders/current" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all hover:bg-gray-50 text-gray-700" active-class="bg-pink-500/10 text-pink-500 font-bold">
            <ShoppingBag class="w-4 h-4 text-gray-400" />
            <span>Current Orders</span>
          </router-link>
          <router-link to="/orders/history" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all hover:bg-gray-50 text-gray-700" active-class="bg-pink-500/10 text-pink-500 font-bold">
            <Calendar class="w-4 h-4 text-gray-400" />
            <span>Order History</span>
          </router-link>
          <router-link to="/favorites" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all hover:bg-gray-50 text-gray-700" active-class="bg-pink-500/10 text-pink-500 font-bold">
            <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span>Favorites</span>
          </router-link>
        </div>
      </div>

      <!-- Favorites Main Content -->
      <div class="lg:col-span-2 bg-white border border-gray-100 p-6 sm:p-8 rounded-lg shadow-sm text-left">
        <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            My Favorites
          </h2>
          <button 
            @click="fetchWishlist" 
            class="text-xs font-semibold text-pink-500 hover:underline bg-transparent border-0 cursor-pointer outline-none"
          >
            Refresh Wishlist
          </button>
        </div>

        <div v-if="actionSuccessMsg" class="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-sm text-emerald-700 font-semibold">
          {{ actionSuccessMsg }}
        </div>

        <div v-if="loading" class="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 class="w-8 h-8 animate-spin text-pink-500" />
          <span class="text-sm font-medium">Retrieving favorites from database...</span>
        </div>

        <div v-else-if="errorMsg" class="bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-2 mb-6">
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
          <div class="text-sm text-red-700 font-medium">{{ errorMsg }}</div>
        </div>

        <div v-else-if="wishlist.length === 0" class="py-16 text-center">
          <div class="w-16 h-16 bg-gray-50 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart class="w-8 h-8 fill-current" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">Your wishlist is empty</h3>
          <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Save items that you like to your favorites list so you can purchase them later.
          </p>
          <router-link 
            to="/shop" 
            class="inline-block bg-pink-500 text-white font-bold text-xs tracking-wide py-3 px-6 rounded-md shadow-sm hover:opacity-95 mt-6 transition-all"
          >
            Explore Shop
          </router-link>
        </div>

        <!-- Wishlist Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div 
            v-for="prod in wishlist" 
            :key="prod._id" 
            class="border border-gray-100 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm group hover:border-gray-200 transition-all"
          >
            <div class="relative bg-gray-50 flex items-center justify-center h-48 border-b border-gray-50 overflow-hidden">
              <img 
                :src="prod.thumbnail || prod.image || 'https://via.placeholder.com/300'" 
                :alt="prod.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <button 
                @click="handleRemoveFromWishlist(prod._id)"
                class="absolute top-3 right-3 bg-white p-2 rounded-full text-rose-500 shadow-sm border border-gray-100 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                title="Remove from favorites"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <div class="p-4 text-left flex-grow flex flex-col justify-between">
              <div>
                <span class="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">{{ prod.brand || 'Brand' }}</span>
                <router-link :to="`/products/${prod._id}`" class="block font-bold text-gray-800 text-sm hover:text-pink-500 transition-colors mt-0.5 truncate">
                  {{ prod.title || prod.name }}
                </router-link>
                <div class="text-sm font-black text-gray-900 mt-2">${{ prod.price.toFixed(2) }}</div>
              </div>

              <div class="mt-4 flex gap-2 pt-2 border-t border-gray-50">
                <router-link 
                  :to="`/products/${prod._id}`" 
                  class="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-[11px] tracking-wide py-2 px-3 rounded text-center transition-all"
                >
                  Details
                </router-link>
                <button 
                  @click="handleAddToCart(prod)" 
                  class="flex-1 bg-pink-500 text-white font-bold text-[11px] tracking-wide py-2 px-3 rounded flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ShoppingCart class="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
