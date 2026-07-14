<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Search, 
  RotateCcw, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  X,
  Filter
} from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { API_BASE_URL } from '../config'

const route = useRoute()
const router = useRouter()

// UI state
const products = ref<any[]>([])
const categories = ref<any[]>([])
const brands = ref<any[]>([])
const loading = ref(true)
const isMobileSidebarOpen = ref(false)

// Pagination state
const pagination = reactive({
  total: 0,
  pages: 1,
  page: 1,
  limit: 12,
  hasNext: false,
  hasPrevious: false
})

// Filters state
const filters = reactive({
  search: (route.query.search as string) || '',
  category: (route.query.category as string) || '',
  brand: (route.query.brand as string) || '',
  minPrice: (route.query.minPrice as string) || '',
  maxPrice: (route.query.maxPrice as string) || '',
  minRating: (route.query.minRating as string) || '',
  stock: (route.query.stock as string) || '',
  sort: (route.query.sort as string) || 'newest'
})

// Price inputs for local state before applying
const priceRange = reactive({
  min: filters.minPrice,
  max: filters.maxPrice
})

// Star ratings list
const ratingOptions = [
  { value: 4, label: '4.0 & Up' },
  { value: 3, label: '3.0 & Up' },
  { value: 2, label: '2.0 & Up' },
]

// Stock status options
const stockOptions = [
  { value: 'inStock', label: 'In Stock' },
  { value: 'lowStock', label: 'Low Stock' },
  { value: 'outOfStock', label: 'Out of Stock' }
]

// Fetch categories
const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`)
    categories.value = await res.json()
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

// Fetch brands
const fetchBrands = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/brands`)
    brands.value = await res.json()
  } catch (err) {
    console.error('Error fetching brands:', err)
  }
}

// Fetch products based on filters and page
const fetchProducts = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.brand) params.append('brand', filters.brand)
    if (filters.minPrice) params.append('minPrice', String(filters.minPrice))
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice))
    if (filters.minRating) params.append('minRating', String(filters.minRating))
    if (filters.stock) params.append('stock', filters.stock)
    if (filters.sort) params.append('sort', filters.sort)
    
    params.append('page', String(pagination.page))
    params.append('limit', String(pagination.limit))

    const res = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`)
    const data = await res.json()
    
    products.value = data.products
    pagination.total = data.total
    pagination.pages = data.pages
    pagination.hasNext = data.hasNext
    pagination.hasPrevious = data.hasPrevious
  } catch (err) {
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
}

// Sync route queries on load
const syncRouteToFilters = () => {
  filters.search = (route.query.search as string) || ''
  filters.category = (route.query.category as string) || ''
  filters.brand = (route.query.brand as string) || ''
  filters.minPrice = (route.query.minPrice as string) || ''
  filters.maxPrice = (route.query.maxPrice as string) || ''
  filters.minRating = (route.query.minRating as string) || ''
  filters.stock = (route.query.stock as string) || ''
  filters.sort = (route.query.sort as string) || 'newest'
  
  priceRange.min = filters.minPrice
  priceRange.max = filters.maxPrice
  
  pagination.page = parseInt(route.query.page as string, 10) || 1
}

// Update router queries to trigger fetch via watcher
const applyFilters = () => {
  const query: any = {}
  if (filters.search) query.search = filters.search
  if (filters.category) query.category = filters.category
  if (filters.brand) query.brand = filters.brand
  if (filters.minPrice) query.minPrice = filters.minPrice
  if (filters.maxPrice) query.maxPrice = filters.maxPrice
  if (filters.minRating) query.minRating = filters.minRating
  if (filters.stock) query.stock = filters.stock
  if (filters.sort) query.sort = filters.sort
  
  // Reset page when filters change (unless page is explicitly modified)
  query.page = 1
  
  router.push({ path: '/shop', query })
}

// Apply price filters
const applyPriceFilter = () => {
  filters.minPrice = priceRange.min
  filters.maxPrice = priceRange.max
  applyFilters()
}

// Select a single category
const selectCategory = (catName: string) => {
  filters.category = filters.category === catName ? '' : catName
  applyFilters()
}

// Toggle brand in list
const toggleBrand = (brandName: string) => {
  // Support multiple brands as comma separated values
  let selectedBrands = filters.brand ? filters.brand.split(',') : []
  
  if (selectedBrands.includes(brandName)) {
    selectedBrands = selectedBrands.filter(b => b !== brandName)
  } else {
    selectedBrands.push(brandName)
  }
  
  filters.brand = selectedBrands.join(',')
  applyFilters()
}

const isBrandSelected = (brandName: string) => {
  const selectedBrands = filters.brand ? filters.brand.split(',') : []
  return selectedBrands.includes(brandName)
}

// Set rating
const selectRating = (rating: number) => {
  filters.minRating = filters.minRating === String(rating) ? '' : String(rating)
  applyFilters()
}

// Reset all filters
const resetFilters = () => {
  filters.search = ''
  filters.category = ''
  filters.brand = ''
  filters.minPrice = ''
  filters.maxPrice = ''
  filters.minRating = ''
  filters.stock = ''
  filters.sort = 'newest'
  
  priceRange.min = ''
  priceRange.max = ''
  
  pagination.page = 1
  router.push({ path: '/shop' })
}

// Go to page
const goToPage = (p: number) => {
  if (p < 1 || p > pagination.pages) return
  pagination.page = p
  
  const query = { ...route.query, page: String(p) }
  router.push({ path: '/shop', query })
}

// Watchers
watch(() => route.query, () => {
  syncRouteToFilters()
  fetchProducts()
}, { deep: true })

onMounted(async () => {
  syncRouteToFilters()
  await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchProducts()
  ])
})

// Compute active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.search) count++
  if (filters.category) count++
  if (filters.brand) count += filters.brand.split(',').filter(Boolean).length
  if (filters.minPrice || filters.maxPrice) count++
  if (filters.minRating) count++
  if (filters.stock) count++
  return count
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-16 font-sans">
    <!-- Breadcrumb section -->
    <div class="bg-white border-b border-gray-100 py-4 mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-xs text-gray-500 gap-1.5 uppercase font-medium tracking-wide">
        <router-link to="/" class="hover:text-pink-500 transition-colors">Home</router-link>
        <span>/</span>
        <span class="text-gray-900 font-semibold">Shop Catalog</span>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- SIDEBAR - Desktop (hidden on mobile) -->
        <aside class="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-fit self-start sticky top-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <h2 class="text-sm font-bold text-gray-900 tracking-wide flex items-center gap-2">
              <SlidersHorizontal class="w-4 h-4 text-gray-500" /> FILTERS
            </h2>
            <button 
              v-if="activeFiltersCount > 0" 
              @click="resetFilters" 
              class="text-xs text-pink-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw class="w-3.5 h-3.5" /> Clear All
            </button>
          </div>

          <!-- Search Widget -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Search</h3>
            <div class="relative">
              <input 
                v-model="filters.search"
                @keyup.enter="applyFilters"
                type="text" 
                placeholder="Product name, brand..." 
                class="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm pr-9 focus:outline-none focus:border-pink-500 focus:bg-white transition-colors"
              />
              <Search 
                @click="applyFilters" 
                class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-pink-500" 
              />
            </div>
          </div>

          <!-- Categories Widget -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Categories</h3>
            <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button 
                v-for="cat in categories" 
                :key="cat._id"
                @click="selectCategory(cat.name)"
                class="w-full text-left text-sm py-1 px-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-between group"
                :class="filters.category === cat.name ? 'bg-pink-500/10 text-pink-500 font-semibold' : 'text-gray-600'"
              >
                <span>{{ cat.name }}</span>
                <span 
                  class="text-[10px] bg-gray-100 text-gray-500 group-hover:bg-pink-500/20 group-hover:text-pink-500 rounded px-1.5 py-0.5 transition-colors"
                  :class="filters.category === cat.name ? 'bg-pink-500/20 text-pink-500' : ''"
                >
                  &rarr;
                </span>
              </button>
            </div>
          </div>

          <!-- Brands Widget -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Brands</h3>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label 
                v-for="brand in brands" 
                :key="brand"
                class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-pink-500 select-none"
              >
                <input 
                  type="checkbox" 
                  :checked="isBrandSelected(brand)"
                  @change="toggleBrand(brand)"
                  class="accent-pink-500 rounded cursor-pointer"
                />
                <span :class="isBrandSelected(brand) ? 'text-pink-500 font-semibold' : ''">{{ brand }}</span>
              </label>
            </div>
          </div>

          <!-- Price Range Widget -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Price Range</h3>
            <div class="flex gap-2 items-center mb-3">
              <input 
                v-model="priceRange.min"
                type="number" 
                placeholder="Min" 
                class="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-center focus:outline-none focus:border-pink-500 focus:bg-white"
              />
              <span class="text-gray-400 text-xs">-</span>
              <input 
                v-model="priceRange.max"
                type="number" 
                placeholder="Max" 
                class="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-center focus:outline-none focus:border-pink-500 focus:bg-white"
              />
            </div>
            <button 
              @click="applyPriceFilter"
              class="w-full bg-pink-500 text-white font-semibold text-xs py-2 rounded hover:opacity-95 transition-opacity"
            >
              Apply Price
            </button>
          </div>

          <!-- Rating Widget -->
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Ratings</h3>
            <div class="space-y-1.5">
              <button 
                v-for="option in ratingOptions" 
                :key="option.value"
                @click="selectRating(option.value)"
                class="flex items-center gap-2 w-full hover:bg-gray-50 py-1 px-1.5 rounded transition-colors text-left"
                :class="filters.minRating === String(option.value) ? 'bg-pink-500/5 border-l-2 border-pink-500 pl-1 font-semibold' : ''"
              >
                <div class="flex text-amber-400">
                  <Star 
                    v-for="n in 5" 
                    :key="n" 
                    class="w-3.5 h-3.5" 
                    :class="n <= option.value ? 'fill-current' : 'text-gray-200 fill-current'" 
                  />
                </div>
                <span class="text-xs text-gray-600 font-medium" :class="filters.minRating === String(option.value) ? 'text-pink-500' : ''">
                  {{ option.label }}
                </span>
              </button>
            </div>
          </div>

          <!-- Stock Availability -->
          <div>
            <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Availability</h3>
            <div class="space-y-2">
              <label 
                v-for="opt in stockOptions" 
                :key="opt.value"
                class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-pink-500 select-none"
              >
                <input 
                  type="radio" 
                  name="stock-availability"
                  :checked="filters.stock === opt.value"
                  @click="filters.stock = filters.stock === opt.value ? '' : opt.value; applyFilters()"
                  class="accent-pink-500 cursor-pointer"
                />
                <span :class="filters.stock === opt.value ? 'text-pink-500 font-semibold' : ''">{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- MAIN PRODUCTS GRID AREA -->
        <div class="flex-grow">
          <!-- Sort / View Controller Bar -->
          <div class="bg-white border border-gray-100 p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <!-- Count info -->
            <div class="text-sm text-gray-500">
              <span v-if="loading" class="animate-pulse">Loading products...</span>
              <span v-else>
                Showing 
                <span class="font-bold text-gray-900">{{ products.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0 }}</span>
                - 
                <span class="font-bold text-gray-900">{{ (pagination.page - 1) * pagination.limit + products.length }}</span>
                of 
                <span class="font-bold text-gray-900">{{ pagination.total }}</span>
                products
              </span>
            </div>

            <!-- Sort and Mobile Filter trigger -->
            <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <!-- Mobile filter trigger button -->
              <button 
                @click="isMobileSidebarOpen = true"
                class="lg:hidden flex items-center gap-1.5 border border-gray-200 px-4 py-2 rounded text-sm text-gray-700 font-semibold bg-gray-50 hover:bg-gray-100 cursor-pointer active:scale-95 transition-all"
              >
                <Filter class="w-4 h-4" /> Filters
                <span v-if="activeFiltersCount > 0" class="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {{ activeFiltersCount }}
                </span>
              </button>

              <!-- Sorting dropdown -->
              <div class="flex items-center gap-2">
                <label for="sort-select" class="text-xs text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">Sort By</label>
                <select 
                  id="sort-select"
                  v-model="filters.sort"
                  @change="applyFilters"
                  class="bg-white border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="priceAsc">Price Low &rarr; High</option>
                  <option value="priceDesc">Price High &rarr; Low</option>
                  <option value="ratingDesc">Highest Rated</option>
                  <option value="alphaAsc">Alphabetical A-Z</option>
                  <option value="alphaDesc">Alphabetical Z-A</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Product Card Grid -->
          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <!-- Loading Skeletons -->
            <div v-for="i in pagination.limit" :key="i" class="bg-white border border-gray-100 p-5 rounded-lg animate-pulse flex flex-col h-[400px]">
              <div class="aspect-square bg-gray-100 rounded-md mb-4 flex-shrink-0"></div>
              <div class="h-3 bg-gray-100 rounded w-1/4 mb-2.5"></div>
              <div class="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
              <div class="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
              <div class="mt-auto h-8 bg-gray-100 rounded w-full"></div>
            </div>
          </div>

          <!-- Empty State -->
          <div 
            v-else-if="products.length === 0" 
            class="bg-white border border-gray-100 rounded-lg p-16 text-center flex flex-col items-center justify-center shadow-sm"
          >
            <div class="w-20 h-20 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center mb-6">
              <RotateCcw class="w-10 h-10" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">No Matching Products</h3>
            <p class="text-gray-500 text-sm max-w-md mb-8">
              We couldn't find any products matching your current search criteria. Try removing some filters or search keywords.
            </p>
            <button 
              @click="resetFilters" 
              class="bg-pink-500 text-white font-semibold text-sm py-3 px-8 rounded shadow hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
            >
              Reset All Filters
            </button>
          </div>

          <!-- Grid of Products -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div v-for="product in products" :key="product._id" class="h-full">
              <ProductCard :product="product" />
            </div>
          </div>

          <!-- Pagination Bar -->
          <div 
            v-if="!loading && pagination.pages > 1" 
            class="mt-12 flex justify-center items-center gap-1.5"
          >
            <button 
              @click="goToPage(pagination.page - 1)" 
              :disabled="!pagination.hasPrevious"
              class="w-9 h-9 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:border-pink-500 hover:text-pink-500 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <button 
              v-for="p in pagination.pages" 
              :key="p"
              @click="goToPage(p)"
              class="w-9 h-9 border rounded text-xs font-semibold shadow-sm transition-all"
              :class="pagination.page === p 
                ? 'bg-pink-500 border-pink-500 text-white scale-105' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-pink-500 hover:text-pink-500'"
            >
              {{ p }}
            </button>

            <button 
              @click="goToPage(pagination.page + 1)" 
              :disabled="!pagination.hasNext"
              class="w-9 h-9 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:border-pink-500 hover:text-pink-500 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- MOBILE SIDEBAR DRAWER (Slide over menu) -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isMobileSidebarOpen" 
        class="fixed inset-0 z-50 overflow-hidden lg:hidden"
        role="dialog" 
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div @click="isMobileSidebarOpen = false" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

        <!-- Panel container -->
        <div class="absolute inset-y-0 left-0 max-w-full flex pr-10">
          <transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
          >
            <div class="w-screen max-w-xs bg-white p-6 shadow-xl flex flex-col h-full overflow-y-auto">
              <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal class="w-4 h-4 text-gray-500" /> Filters
                </h2>
                <button 
                  @click="isMobileSidebarOpen = false" 
                  class="p-1 rounded-full text-gray-400 hover:text-gray-500 active:bg-gray-100"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Clear all in mobile drawer -->
              <button 
                v-if="activeFiltersCount > 0" 
                @click="resetFilters(); isMobileSidebarOpen = false" 
                class="w-full mb-6 py-2 border border-pink-500/20 bg-pink-500/5 rounded text-xs text-pink-500 font-bold hover:bg-pink-500/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw class="w-4 h-4" /> Reset All Filters
              </button>

              <!-- Mobile Search Widget -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Search</h3>
                <div class="relative">
                  <input 
                    v-model="filters.search"
                    @keyup.enter="applyFilters(); isMobileSidebarOpen = false"
                    type="text" 
                    placeholder="Product name, brand..." 
                    class="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm pr-9 focus:outline-none focus:border-pink-500 focus:bg-white"
                  />
                  <Search 
                    @click="applyFilters(); isMobileSidebarOpen = false" 
                    class="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" 
                  />
                </div>
              </div>

              <!-- Mobile Categories Widget -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Categories</h3>
                <div class="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <button 
                    v-for="cat in categories" 
                    :key="cat._id"
                    @click="selectCategory(cat.name); isMobileSidebarOpen = false"
                    class="w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-between text-gray-600"
                    :class="filters.category === cat.name ? 'bg-pink-500/10 text-pink-500 font-semibold' : ''"
                  >
                    <span>{{ cat.name }}</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>

              <!-- Mobile Brands Widget -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Brands</h3>
                <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                  <label 
                    v-for="brand in brands" 
                    :key="brand"
                    class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      :checked="isBrandSelected(brand)"
                      @change="toggleBrand(brand)"
                      class="accent-pink-500 rounded cursor-pointer"
                    />
                    <span :class="isBrandSelected(brand) ? 'text-pink-500 font-semibold' : ''">{{ brand }}</span>
                  </label>
                </div>
              </div>

              <!-- Mobile Price Range Widget -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Price Range</h3>
                <div class="flex gap-2 items-center mb-3">
                  <input 
                    v-model="priceRange.min"
                    type="number" 
                    placeholder="Min" 
                    class="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-center focus:outline-none focus:border-pink-500"
                  />
                  <span class="text-gray-400 text-xs">-</span>
                  <input 
                    v-model="priceRange.max"
                    type="number" 
                    placeholder="Max" 
                    class="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-center focus:outline-none focus:border-pink-500"
                  />
                </div>
                <button 
                  @click="applyPriceFilter(); isMobileSidebarOpen = false"
                  class="w-full bg-pink-500 text-white font-semibold text-xs py-2 rounded hover:opacity-95"
                >
                  Apply Price
                </button>
              </div>

              <!-- Mobile Rating Widget -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Ratings</h3>
                <div class="space-y-2">
                  <button 
                    v-for="option in ratingOptions" 
                    :key="option.value"
                    @click="selectRating(option.value); isMobileSidebarOpen = false"
                    class="flex items-center gap-2 w-full hover:bg-gray-50 py-1.5 px-2 rounded text-left"
                    :class="filters.minRating === String(option.value) ? 'bg-pink-500/5 border-l-2 border-pink-500 font-semibold' : ''"
                  >
                    <div class="flex text-amber-400">
                      <Star 
                        v-for="n in 5" 
                        :key="n" 
                        class="w-3.5 h-3.5" 
                        :class="n <= option.value ? 'fill-current' : 'text-gray-200 fill-current'" 
                      />
                    </div>
                    <span class="text-xs text-gray-600" :class="filters.minRating === String(option.value) ? 'text-pink-500 font-bold' : ''">
                      {{ option.label }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Mobile Stock Availability -->
              <div class="mb-8">
                <h3 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Availability</h3>
                <div class="space-y-2">
                  <label 
                    v-for="opt in stockOptions" 
                    :key="opt.value"
                    class="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer"
                  >
                    <input 
                      type="radio" 
                      name="stock-availability-mobile"
                      :checked="filters.stock === opt.value"
                      @click="filters.stock = filters.stock === opt.value ? '' : opt.value; applyFilters(); isMobileSidebarOpen = false"
                      class="accent-pink-500 cursor-pointer"
                    />
                    <span :class="filters.stock === opt.value ? 'text-pink-500 font-semibold' : ''">{{ opt.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </div>
</template>
