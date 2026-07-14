<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Star, 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  Maximize2, 
  ShoppingBag,
  MessageSquare,
  Calendar,
  AlertTriangle,
  X,
  Heart
} from 'lucide-vue-next'
import { API_BASE_URL } from '../config'

const route = useRoute()
const router = useRouter()

const product = ref<any>(null)
const loading = ref(true)
const errorMsg = ref('')

// Cart states
import { useCart } from '../composables/useCart'
import { useAuth } from '../composables/useAuth'
const { addToCart } = useCart()
const { token, isAuthenticated } = useAuth()
const cartSuccessMsg = ref('')
const successType = ref<'cart' | 'favorite_add' | 'favorite_remove' | ''>('')
const cartErrorMsg = ref('')
const quantity = ref(1)

// AuthRequired Modal state
const showAuthModal = ref(false)

// Wishlist/Favorites state
const isInWishlist = ref(false)

const checkWishlistStatus = async () => {
  if (!isAuthenticated.value || !token.value || !product.value) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      isInWishlist.value = data && Array.isArray(data) && data.some((item: any) => item && item._id === product.value._id)
    }
  } catch (err) {
    console.error('Error checking wishlist status:', err)
  }
}

const handleToggleWishlist = async () => {
  if (!isAuthenticated.value) {
    showAuthModal.value = true
    return
  }
  
  cartSuccessMsg.value = ''
  successType.value = ''
  cartErrorMsg.value = ''
  
  try {
    if (isInWishlist.value) {
      const res = await fetch(`${API_BASE_URL}/api/auth/wishlist/${product.value._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      if (res.ok) {
        isInWishlist.value = false
        successType.value = 'favorite_remove'
        cartSuccessMsg.value = 'Removed from favorites!'
        setTimeout(() => {
          if (successType.value === 'favorite_remove') {
            cartSuccessMsg.value = ''
            successType.value = ''
          }
        }, 3000)
      } else {
        throw new Error('Failed to remove from favorites')
      }
    } else {
      const res = await fetch(`${API_BASE_URL}/api/auth/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ productId: product.value._id })
      })
      if (res.ok) {
        isInWishlist.value = true
        successType.value = 'favorite_add'
        cartSuccessMsg.value = 'Added to favorites!'
        setTimeout(() => {
          if (successType.value === 'favorite_add') {
            cartSuccessMsg.value = ''
            successType.value = ''
          }
        }, 3000)
      } else {
        throw new Error('Failed to add to favorites')
      }
    }
  } catch (err: any) {
    cartErrorMsg.value = err.message || 'Failed to update favorites.'
  }
}

const handleAddToCart = () => {
  cartSuccessMsg.value = ''
  successType.value = ''
  cartErrorMsg.value = ''
  if (!isAuthenticated.value) {
    showAuthModal.value = true
    return
  }
  try {
    addToCart(product.value, quantity.value)
    successType.value = 'cart'
    cartSuccessMsg.value = 'Product added to cart successfully!'
    // Automatically clear success message after 4 seconds
    setTimeout(() => {
      if (successType.value === 'cart') {
        cartSuccessMsg.value = ''
        successType.value = ''
      }
    }, 4000)
  } catch (err: any) {
    cartErrorMsg.value = err.message || 'Failed to add product to cart.'
  }
}

// Image gallery state
const activeImageIndex = ref(0)

// Helper to get category name
const getCategoryName = (cat: any) => {
  if (!cat) return 'General'
  if (typeof cat === 'object') return cat.name || 'General'
  return cat
}

// Fetch single product details
const fetchProductDetails = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const id = route.params.id
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`)
    
    if (res.status === 404) {
      errorMsg.value = 'Product not found'
      return
    }
    
    if (!res.ok) {
      throw new Error('Failed to fetch product details')
    }

    product.value = await res.json()
    activeImageIndex.value = 0
  } catch (err: any) {
    console.error('Error fetching product:', err)
    errorMsg.value = err.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}


// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Product images list
const productImages = computed(() => {
  if (!product.value) return []
  const list = []
  if (product.value.thumbnail) list.push(product.value.thumbnail)
  if (product.value.images && Array.isArray(product.value.images)) {
    product.value.images.forEach((img: string) => {
      if (img !== product.value.thumbnail) list.push(img)
    })
  }
  if (list.length === 0 && product.value.image) list.push(product.value.image)
  return list
})

// Review form state
const reviewRating = ref('')
const reviewComment = ref('')
const reviewErrorMsg = ref('')
const reviewSuccessMsg = ref('')
const reviewLoading = ref(false)

const handleSubmitReview = async () => {
  reviewErrorMsg.value = ''
  reviewSuccessMsg.value = ''

  if (!reviewRating.value || !reviewComment.value.trim()) {
    reviewErrorMsg.value = 'Rating and review text are required'
    return
  }

  if (!token.value) {
    reviewErrorMsg.value = 'Please login to add a review.'
    return
  }

  reviewLoading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${product.value._id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        rating: Number(reviewRating.value),
        comment: reviewComment.value
      })
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to submit review')
    }

    product.value = await res.json()
    reviewRating.value = ''
    reviewComment.value = ''
    reviewSuccessMsg.value = 'Review added successfully!'
  } catch (err: any) {
    reviewErrorMsg.value = err.message || 'Failed to submit review'
  } finally {
    reviewLoading.value = false
  }
}

onMounted(async () => {
  await fetchProductDetails()
  if (product.value) {
    await checkWishlistStatus()
  }
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-16 font-sans">
    <!-- Breadcrumb section -->
    <div class="bg-white border-b border-gray-100 py-4 mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div class="flex items-center text-xs text-gray-500 gap-1.5 uppercase font-medium tracking-wide">
          <router-link to="/" class="hover:text-pink-500 transition-colors">Home</router-link>
          <span>/</span>
          <router-link to="/shop" class="hover:text-pink-500 transition-colors">Shop</router-link>
          <span v-if="product">/</span>
          <span v-if="product" class="text-gray-500 hover:text-pink-500 cursor-pointer" @click="router.push({ path: '/shop', query: { category: getCategoryName(product.category) } })">
            {{ getCategoryName(product.category) }}
          </span>
          <span>/</span>
          <span v-if="product" class="text-gray-900 font-semibold truncate max-w-[150px] sm:max-w-xs">{{ product.title }}</span>
        </div>

        <button 
          @click="router.back()" 
          class="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-pink-500 transition-colors"
        >
          <ChevronLeft class="w-4 h-4" /> BACK
        </button>
      </div>
    </div>

    <!-- MAIN DETAIL WRAPPER -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- LOADING STATE -->
      <div v-if="loading" class="bg-white border border-gray-100 rounded-lg p-6 sm:p-10 shadow-sm animate-pulse">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <!-- Image skeleton -->
          <div class="flex flex-col gap-4">
            <div class="aspect-square bg-gray-100 rounded-lg w-full"></div>
            <div class="flex gap-3">
              <div v-for="i in 4" :key="i" class="w-16 h-16 bg-gray-100 rounded"></div>
            </div>
          </div>
          <!-- Info skeleton -->
          <div class="flex flex-col gap-4">
            <div class="h-3 bg-gray-100 rounded w-1/4"></div>
            <div class="h-8 bg-gray-100 rounded w-3/4"></div>
            <div class="h-4 bg-gray-100 rounded w-1/3"></div>
            <div class="h-10 bg-gray-100 rounded w-1/2"></div>
            <div class="h-20 bg-gray-100 rounded w-full"></div>
            <div class="h-10 bg-gray-100 rounded w-1/3 mt-6"></div>
          </div>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div 
        v-else-if="errorMsg" 
        class="bg-white border border-gray-100 rounded-lg p-16 text-center max-w-xl mx-auto shadow-sm"
      >
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Error Loading Product</h3>
        <p class="text-gray-500 text-sm mb-8">{{ errorMsg }}</p>
        <router-link 
          to="/shop" 
          class="bg-pink-500 text-white font-semibold text-sm py-3 px-8 rounded shadow hover:opacity-95 active:scale-95 transition-all inline-block"
        >
          Return to Shop
        </router-link>
      </div>

      <!-- PRODUCT CONTENT -->
      <div v-else-if="product">
        <div class="bg-white border border-gray-100 rounded-lg p-6 sm:p-10 shadow-sm mb-10">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <!-- Left Column: Interactive Image Gallery -->
            <div class="flex flex-col">
              <!-- Main Image Container -->
              <div class="aspect-square bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden p-6 relative">
                <img 
                  :src="productImages[activeImageIndex]" 
                  :alt="product.title" 
                  class="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                />
                <!-- Sale Badge -->
                <span 
                  v-if="product.isOnSale" 
                  class="absolute top-4 left-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded shadow"
                >
                  -{{ Math.round(product.discountPercentage) }}% OFF
                </span>
              </div>

              <!-- Thumbnails List -->
              <div 
                v-if="productImages.length > 1" 
                class="flex gap-3 mt-4 overflow-x-auto pb-1"
              >
                <button 
                  v-for="(img, idx) in productImages" 
                  :key="idx"
                  @click="activeImageIndex = idx"
                  class="w-20 h-20 bg-gray-50 border rounded-md flex-shrink-0 flex items-center justify-center p-1.5 focus:outline-none transition-all"
                  :class="activeImageIndex === idx ? 'border-pink-500 ring-1 ring-pink-500' : 'border-gray-200 hover:border-gray-400'"
                >
                  <img :src="img" :alt="`${product.title} ${idx}`" class="max-w-full max-h-full object-contain mix-blend-multiply" />
                </button>
              </div>
            </div>

            <!-- Right Column: Details & Actions -->
            <div class="flex flex-col text-left">
              <!-- Brand & Category -->
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs font-bold text-pink-500 uppercase tracking-wider bg-pink-500/10 px-2.5 py-1 rounded">
                  {{ getCategoryName(product.category) }}
                </span>
                <span v-if="product.brand" class="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded">
                  {{ product.brand }}
                </span>
              </div>

              <!-- Title -->
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
                {{ product.title }}
              </h1>

              <!-- Ratings and SKU -->
              <div class="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-5 mb-5">
                <div class="flex items-center gap-1.5">
                  <div class="flex text-amber-400">
                    <Star 
                      v-for="n in 5" 
                      :key="n" 
                      class="w-4 h-4 fill-current" 
                      :class="n <= Math.floor(product.rating || 0) ? 'fill-current' : 'text-gray-200 fill-current'" 
                    />
                  </div>
                  <span class="text-sm font-semibold text-gray-800">{{ product.rating?.toFixed(1) || '0.0' }}</span>
                  <span class="text-xs text-gray-400">|</span>
                  <span class="text-xs text-gray-500 font-semibold">{{ product.reviews?.length || 0 }} Reviews</span>
                </div>
                
                <span v-if="product.sku" class="text-xs text-gray-400 font-medium">
                  SKU: <span class="text-gray-600 font-bold font-mono">{{ product.sku }}</span>
                </span>
              </div>

              <!-- Price Section -->
              <div class="mb-6 bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
                <div>
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Special Price</div>
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-extrabold text-pink-500">
                      ${{ product.price.toFixed(2) }}
                    </span>
                    <span 
                      v-if="product.isOnSale && product.originalPrice" 
                      class="text-base text-gray-400 line-through font-medium"
                    >
                      ${{ product.originalPrice.toFixed(2) }}
                    </span>
                  </div>
                </div>

                <!-- Stock badge -->
                <div class="text-right">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Availability</div>
                  <span 
                    v-if="product.stock === 0" 
                    class="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100"
                  >
                    Out Of Stock
                  </span>
                  <span 
                    v-else-if="product.stock <= 5" 
                    class="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-100"
                  >
                    Low Stock: Only {{ product.stock }} Left
                  </span>
                  <span 
                    v-else 
                    class="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100"
                  >
                    In Stock ({{ product.stock }})
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-6">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                <p class="text-sm text-gray-600 leading-relaxed font-normal">
                  {{ product.description }}
                </p>
              </div>

              <!-- Specifications Grid -->
              <div class="grid grid-cols-2 gap-y-4 gap-x-6 mb-8 text-sm border-t border-b border-gray-100 py-6">
                <div v-if="product.shippingInformation" class="flex items-center gap-2.5">
                  <Truck class="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <span class="text-xs text-gray-400 block font-medium">Shipping</span>
                    <span class="text-xs text-gray-700 font-semibold">{{ product.shippingInformation }}</span>
                  </div>
                </div>

                <div v-if="product.warrantyInformation" class="flex items-center gap-2.5">
                  <ShieldCheck class="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <span class="text-xs text-gray-400 block font-medium">Warranty</span>
                    <span class="text-xs text-gray-700 font-semibold">{{ product.warrantyInformation }}</span>
                  </div>
                </div>

                <div v-if="product.dimensions && (product.dimensions.width || product.dimensions.height)" class="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <Maximize2 class="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <span class="text-xs text-gray-400 block font-medium">Dimensions (W x H x D)</span>
                    <span class="text-xs text-gray-700 font-semibold">
                      {{ product.dimensions.width }} x {{ product.dimensions.height }} x {{ product.dimensions.depth }} cm
                    </span>
                  </div>
                </div>
              </div>

              <!-- Tags pills -->
              <div v-if="product.tags && product.tags.length > 0" class="mb-8 flex flex-wrap gap-1.5 items-center">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Tags:</span>
                <span 
                  v-for="tag in product.tags" 
                  :key="tag"
                  class="bg-gray-100 hover:bg-pink-500/10 hover:text-pink-500 text-gray-600 text-xs px-2.5 py-1 rounded transition-colors cursor-pointer"
                  @click="router.push({ path: '/shop', query: { search: tag } })"
                >
                  #{{ tag }}
                </span>
              </div>

              <!-- Success or Error alerts -->
              <div v-if="cartSuccessMsg" :class="[
                'mb-4 border-l-4 p-4 rounded text-left flex items-center justify-between transition-all duration-300',
                successType === 'cart' ? 'bg-emerald-50 border-emerald-500' :
                successType === 'favorite_add' ? 'bg-rose-50 border-rose-500' :
                'bg-zinc-50 border-zinc-400'
              ]">
                <span :class="[
                  'text-sm font-medium flex items-center gap-2',
                  successType === 'cart' ? 'text-emerald-800' :
                  successType === 'favorite_add' ? 'text-rose-800' :
                  'text-zinc-800'
                ]">
                  <svg v-if="successType === 'cart'" class="w-4 h-4 text-emerald-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <svg v-else-if="successType === 'favorite_add'" class="w-4 h-4 text-rose-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {{ cartSuccessMsg }}
                </span>
                <router-link v-if="successType === 'cart'" to="/cart" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline transition-colors">
                  View Cart
                </router-link>
                <router-link v-else-if="successType === 'favorite_add'" to="/favorites" class="text-xs font-bold text-rose-600 hover:text-rose-700 underline transition-colors">
                  View Favorites
                </router-link>
              </div>

              <div v-if="cartErrorMsg" class="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded text-left">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-red-800 font-medium">{{ cartErrorMsg }}</span>
                  <button @click="cartErrorMsg = ''" class="text-xs text-red-500 font-bold hover:underline">Dismiss</button>
                </div>
                <div v-if="cartErrorMsg.toLowerCase().includes('login')" class="mt-3">
                  <router-link :to="`/login?redirect=${route.fullPath}`" class="inline-flex items-center justify-center bg-red-600 text-white font-semibold text-xs py-1.5 px-4 rounded shadow hover:bg-red-700 transition-colors uppercase">
                    Login to your account
                  </router-link>
                </div>
              </div>

              <!-- Quick Action Button -->
              <div class="flex items-center gap-4">
                <!-- Quantity selector -->
                <div v-if="product.stock > 0" class="flex items-center border border-gray-200 rounded">
                  <button 
                    @click="quantity = Math.max(1, quantity - 1)" 
                    class="px-3 py-3 text-gray-500 hover:text-pink-500 font-bold text-sm"
                  >-</button>
                  <span class="px-3 text-sm font-semibold text-gray-800">{{ quantity }}</span>
                  <button 
                    @click="quantity = Math.min(product.stock, quantity + 1)" 
                    class="px-3 py-3 text-gray-500 hover:text-pink-500 font-bold text-sm"
                  >+</button>
                </div>

                <button 
                  @click="handleAddToCart"
                  class="flex-1 sm:flex-initial bg-pink-500 text-white font-bold text-sm tracking-wide py-4 px-10 rounded shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer"
                  :disabled="product.stock === 0"
                  :class="product.stock === 0 ? 'opacity-50 cursor-not-allowed bg-gray-500' : ''"
                >
                  <ShoppingBag class="w-4 h-4" /> Add to Cart
                </button>

                <!-- Save to Favorites Button -->
                <button 
                  @click="handleToggleWishlist"
                  class="bg-white hover:bg-gray-50 border p-4 rounded shadow-sm transition-all flex items-center justify-center cursor-pointer"
                  :class="isInWishlist ? 'text-rose-500 border-rose-100 hover:bg-rose-50' : 'text-gray-400 border-gray-200'"
                  title="Save to favorites"
                >
                  <Heart class="w-5 h-5" :class="isInWishlist ? 'fill-current' : ''" />
                </button>
              </div>

            </div>

          </div>
        </div>

        <!-- REVIEWS SECTION -->
        <div class="bg-white border border-gray-100 rounded-lg p-6 sm:p-10 shadow-sm text-left">
          <h2 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
            <MessageSquare class="w-5 h-5 text-gray-400" /> CUSTOMER REVIEWS ({{ product.reviews?.length || 0 }})
          </h2>

          <div class="mb-8 border border-gray-100 rounded-lg p-5 bg-gray-50/40">
            <div v-if="!isAuthenticated" class="text-sm text-gray-600 font-medium">
              Please <button type="button" @click="showAuthModal = true" class="text-pink-500 hover:underline font-bold bg-transparent border-0 cursor-pointer p-0 outline-none">login</button> or <button type="button" @click="showAuthModal = true" class="text-pink-500 hover:underline font-bold bg-transparent border-0 cursor-pointer p-0 outline-none">register</button> to submit a review.
            </div>

            <form v-else @submit.prevent="handleSubmitReview" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Rating</label>
                  <select
                    v-model="reviewRating"
                    class="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                    :class="reviewErrorMsg && !reviewRating ? 'border-red-300' : ''"
                  >
                    <option value="">Select rating</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Review</label>
                  <textarea
                    v-model="reviewComment"
                    rows="3"
                    placeholder="Write your review"
                    class="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                    :class="reviewErrorMsg && !reviewComment.trim() ? 'border-red-300' : ''"
                  ></textarea>
                </div>
              </div>

              <div v-if="reviewErrorMsg" class="text-xs text-red-600 font-semibold">
                {{ reviewErrorMsg }}
              </div>
              <div v-if="reviewSuccessMsg" class="text-xs text-emerald-600 font-semibold">
                {{ reviewSuccessMsg }}
              </div>

              <button
                type="submit"
                :disabled="reviewLoading"
                class="bg-pink-500 text-white font-bold text-xs tracking-wide py-2.5 px-6 rounded shadow hover:opacity-95 active:scale-[0.98] transition-all uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ reviewLoading ? 'Submitting...' : 'Submit Review' }}
              </button>
            </form>
          </div>

          <div v-if="!product.reviews || product.reviews.length === 0" class="text-center py-10">
            <p class="text-gray-500 text-sm">No reviews yet for this product. Be the first to leave one!</p>
          </div>

          <div v-else class="space-y-6 divide-y divide-gray-100">
            <div 
              v-for="(rev, idx) in product.reviews" 
              :key="idx"
              class="pt-6 first:pt-0 flex flex-col gap-2"
            >
              <div class="flex justify-between items-start gap-4">
                <div>
                  <h4 class="font-semibold text-gray-800 text-sm">{{ rev.reviewerName }}</h4>
                  <div class="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <span class="font-mono">{{ rev.reviewerEmail }}</span>
                    <span>&bull;</span>
                    <span class="flex items-center gap-1">
                      <Calendar class="w-3 h-3" /> {{ formatDate(rev.date) }}
                    </span>
                  </div>
                </div>

                <!-- Review Rating Stars -->
                <div class="flex text-amber-400 shrink-0">
                  <Star 
                    v-for="n in 5" 
                    :key="n" 
                    class="w-3.5 h-3.5 fill-current" 
                    :class="n <= rev.rating ? 'fill-current' : 'text-gray-200 fill-current'" 
                  />
                </div>
              </div>

              <p class="text-gray-600 text-sm leading-relaxed mt-1 font-normal bg-gray-50/50 p-3 rounded-lg border border-gray-50/30">
                {{ rev.comment }}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>

  <!-- Auth Required Modal -->
  <div v-if="showAuthModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-8 text-center shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
      <!-- Close button -->
      <button 
        @click="showAuthModal = false" 
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer bg-transparent border-0"
      >
        <X class="w-6 h-6" />
      </button>

      <!-- Icon -->
      <div class="w-16 h-16 bg-pink-500/15 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag class="w-8 h-8" />
      </div>

      <h3 class="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
      <p class="text-sm text-gray-600 mb-8 leading-relaxed">
        Please log in or create an account to continue shopping, add products to your cart, or save items to your favorites list.
      </p>

      <div class="flex flex-col sm:flex-row gap-3">
        <router-link 
          :to="`/login?redirect=${route.fullPath}`" 
          class="flex-1 bg-pink-500 text-white font-bold text-sm tracking-wide py-3 px-6 rounded shadow-md hover:opacity-95 text-center transition-all uppercase"
        >
          Login
        </router-link>
        <router-link 
          :to="`/register?redirect=${route.fullPath}`" 
          class="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm tracking-wide py-3 px-6 rounded text-center transition-all uppercase"
        >
          Register
        </router-link>
      </div>
    </div>
  </div>
</template>
