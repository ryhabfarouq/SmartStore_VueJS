<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { 
  Shield, 
  Package, 
  Users, 
  Layers, 
  ShoppingBag, 
  TrendingUp, 
  Percent, 
  Truck, 
  Sparkles,
  LayoutDashboard,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2
} from 'lucide-vue-next'
import { API_BASE_URL } from '../config'

const { user, token } = useAuth()

// Active Section State
const activeSection = ref<'overview' | 'products' | 'users' | 'categories' | 'orders' | 'coupons' | 'homepage'>('overview')

// Loading states
const statsLoading = ref(false)
const actionLoading = ref(false)

// Stats state
const stats = reactive({
  totalRevenue: 0,
  totalProducts: 0,
  activeUsers: 0,
  pendingOrders: 0
})

// Data collections
const productsList = ref<any[]>([])
const usersList = ref<any[]>([])
const categoriesList = ref<any[]>([])
const ordersList = ref<any[]>([])
const couponsList = ref<any[]>([])

// Pagination/Search for Products
const productSearch = ref('')
const selectedProductCategory = ref('')
const productPage = ref(1)
const productPages = ref(1)

// Fetch Administrative Stats
const fetchStats = async () => {
  statsLoading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/stats`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      const data = await res.json()
      stats.totalRevenue = data.totalRevenue
      stats.totalProducts = data.totalProducts
      stats.activeUsers = data.activeUsers
      stats.pendingOrders = data.pendingOrders
    }
  } catch (err) {
    console.error('Error fetching admin stats:', err)
  } finally {
    statsLoading.value = false
  }
}

// FETCH PRODUCTS
const fetchProducts = async () => {
  try {
    let url = `${API_BASE_URL}/api/products?page=${productPage.value}&limit=8`
    if (productSearch.value) url += `&search=${encodeURIComponent(productSearch.value)}`
    if (selectedProductCategory.value) url += `&category=${encodeURIComponent(selectedProductCategory.value)}`
    
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      productsList.value = data.products
      productPages.value = data.pages
    }
  } catch (err) {
    console.error('Error fetching products:', err)
  }
}

// FETCH USERS
const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      usersList.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching users:', err)
  }
}

// FETCH CATEGORIES
const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`)
    if (res.ok) {
      categoriesList.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

// FETCH ORDERS
const fetchOrders = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      ordersList.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching orders:', err)
  }
}

// FETCH COUPONS
const fetchCoupons = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/coupons`, {
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      couponsList.value = await res.json()
    }
  } catch (err) {
    console.error('Error fetching coupons:', err)
  }
}

// Refresh active section data
const refreshData = () => {
  fetchStats()
  if (activeSection.value === 'products') fetchProducts()
  else if (activeSection.value === 'users') fetchUsers()
  else if (activeSection.value === 'categories') fetchCategories()
  else if (activeSection.value === 'orders') fetchOrders()
  else if (activeSection.value === 'coupons') fetchCoupons()
}

// Modals management
const showProductModal = ref(false)
const showCategoryModal = ref(false)
const showCouponModal = ref(false)
const isEditing = ref(false)

// Product Form state
const productForm = reactive({
  _id: '',
  title: '',
  description: '',
  price: 0,
  discountPercentage: 0,
  stock: 0,
  brand: '',
  category: '',
  thumbnail: '',
  availabilityStatus: 'In Stock',
  sku: '',
  shippingInformation: '3-5 business days',
  warrantyInformation: '1 year warranty',
  isFeatured: false,
  isOnSale: false
})

const openAddProductModal = () => {
  isEditing.value = false
  productForm._id = ''
  productForm.title = ''
  productForm.description = ''
  productForm.price = 0
  productForm.discountPercentage = 0
  productForm.stock = 10
  productForm.brand = ''
  productForm.category = categoriesList.value[0]?._id || ''
  productForm.thumbnail = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
  productForm.availabilityStatus = 'In Stock'
  productForm.sku = 'SKU-' + Math.floor(Math.random()*100000)
  productForm.shippingInformation = '3-5 business days'
  productForm.warrantyInformation = '1 year warranty'
  productForm.isFeatured = false
  productForm.isOnSale = false
  
  showProductModal.value = true
}

const openEditProductModal = (prod: any) => {
  isEditing.value = true
  productForm._id = prod._id
  productForm.title = prod.title
  productForm.description = prod.description
  productForm.price = prod.price
  productForm.discountPercentage = prod.discountPercentage || 0
  productForm.stock = prod.stock
  productForm.brand = prod.brand || ''
  productForm.category = typeof prod.category === 'object' ? prod.category._id : prod.category
  productForm.thumbnail = prod.thumbnail || prod.image || ''
  productForm.availabilityStatus = prod.availabilityStatus || 'In Stock'
  productForm.sku = prod.sku || ''
  productForm.shippingInformation = prod.shippingInformation || '3-5 business days'
  productForm.warrantyInformation = prod.warrantyInformation || '1 year warranty'
  productForm.isFeatured = prod.isFeatured || false
  productForm.isOnSale = prod.isOnSale || false
  
  showProductModal.value = true
}

const handleSaveProduct = async () => {
  actionLoading.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value 
      ? `${API_BASE_URL}/api/products/${productForm._id}`
      : `${API_BASE_URL}/api/products`

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(productForm)
    })

    if (res.ok) {
      showProductModal.value = false
      fetchProducts()
      fetchStats()
    } else {
      const err = await res.json()
      alert(err.message || 'Error saving product')
    }
  } catch (err) {
    console.error('Error saving product:', err)
  } finally {
    actionLoading.value = false
  }
}

const handleDeleteProduct = async (id: string) => {
  if (!confirm('Are you sure you want to delete this product?')) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      fetchProducts()
      fetchStats()
    }
  } catch (err) {
    console.error('Error deleting product:', err)
  }
}

// Category Form State
const categoryForm = reactive({
  _id: '',
  name: '',
  image: '',
  description: ''
})

const openAddCategoryModal = () => {
  isEditing.value = false
  categoryForm._id = ''
  categoryForm.name = ''
  categoryForm.image = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab'
  categoryForm.description = ''
  showCategoryModal.value = true
}

const openEditCategoryModal = (cat: any) => {
  isEditing.value = true
  categoryForm._id = cat._id
  categoryForm.name = cat.name
  categoryForm.image = cat.image || ''
  categoryForm.description = cat.description || ''
  showCategoryModal.value = true
}

const handleSaveCategory = async () => {
  actionLoading.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value 
      ? `${API_BASE_URL}/api/categories/${categoryForm._id}`
      : `${API_BASE_URL}/api/categories`

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(categoryForm)
    })

    if (res.ok) {
      showCategoryModal.value = false
      fetchCategories()
    } else {
      const err = await res.json()
      alert(err.message || 'Error saving category')
    }
  } catch (err) {
    console.error('Error saving category:', err)
  } finally {
    actionLoading.value = false
  }
}

const handleDeleteCategory = async (id: string) => {
  if (!confirm('Are you sure you want to delete this category?')) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      fetchCategories()
    }
  } catch (err) {
    console.error('Error deleting category:', err)
  }
}

// User Actions
const handleToggleRestrictUser = async (userObj: any) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userObj._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ isRestricted: !userObj.isRestricted })
    })
    if (res.ok) {
      fetchUsers()
      fetchStats()
    }
  } catch (err) {
    console.error('Error updating user status:', err)
  }
}

const handleToggleApproveUser = async (userObj: any) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userObj._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ isApproved: !userObj.isApproved })
    })
    if (res.ok) {
      fetchUsers()
    }
  } catch (err) {
    console.error('Error updating user approval:', err)
  }
}

const handleChangeUserRole = async (userId: string, newRole: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ role: newRole })
    })
    if (res.ok) {
      fetchUsers()
    }
  } catch (err) {
    console.error('Error updating user role:', err)
  }
}

const handleDeleteUser = async (id: string) => {
  if (!confirm('Are you sure you want to restrict/delete this user account?')) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      fetchUsers()
      fetchStats()
    }
  } catch (err) {
    console.error('Error deleting user:', err)
  }
}

// Order Actions
const handleUpdateOrderStatus = async (orderId: string, status: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ status })
    })
    if (res.ok) {
      fetchOrders()
      fetchStats()
    }
  } catch (err) {
    console.error('Error updating order status:', err)
  }
}

// Coupon Actions
const couponForm = reactive({
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  expirationDate: ''
})

const handleCreateCoupon = async () => {
  actionLoading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: couponForm.discountValue,
        expirationDate: couponForm.expirationDate || undefined
      })
    })

    if (res.ok) {
      showCouponModal.value = false
      couponForm.code = ''
      couponForm.discountType = 'percentage'
      couponForm.discountValue = 10
      couponForm.expirationDate = ''
      fetchCoupons()
    } else {
      const err = await res.json()
      alert(err.message || 'Failed to create coupon')
    }
  } catch (err) {
    console.error('Error creating coupon:', err)
  } finally {
    actionLoading.value = false
  }
}

const handleDeleteCoupon = async (id: string) => {
  if (!confirm('Are you sure you want to delete this coupon?')) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token.value}` }
    })
    if (res.ok) {
      fetchCoupons()
    }
  } catch (err) {
    console.error('Error deleting coupon:', err)
  }
}

// Custom Homepage CMS Text
const homeCMSText = reactive({
  title: 'Upgrade Your Lifestyle',
  subtitle: 'Up to 50% discount on selected collection items',
  buttonText: 'Shop New Arrivals'
})

const handleSaveHomepageCMS = () => {
  alert('Homepage Banner CMS settings simulated and updated successfully!')
}

// Helpers
const getCategoryName = (cat: any) => {
  if (!cat) return 'General'
  if (typeof cat === 'object') return cat.name || 'General'
  return cat
}

onMounted(() => {
  fetchStats()
  fetchCategories() // always need category list for product options
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-16 font-sans text-left flex">
    
    <!-- Sidebar navigation -->
    <aside class="w-64 bg-white border-r border-gray-150 shrink-0 hidden md:flex flex-col justify-between">
      <div class="p-6">
        <div class="flex items-center gap-2 mb-6">
          <Shield class="w-6 h-6 text-pink-500" />
          <span class="font-extrabold text-gray-900 tracking-tight text-lg">Admin Center</span>
        </div>
        
        <nav class="space-y-1.5">
          <button 
            @click="activeSection = 'overview'; refreshData()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="activeSection === 'overview' ? 'bg-pink-500/15 text-pink-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <LayoutDashboard class="w-4.5 h-4.5" /> Dashboard
          </button>
          
          <button 
            @click="activeSection = 'products'; fetchProducts()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="activeSection === 'products' ? 'bg-pink-500/15 text-pink-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <Package class="w-4.5 h-4.5" /> Products CRUD
          </button>
          
          <button 
            @click="activeSection = 'users'; fetchUsers()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="activeSection === 'users' ? 'bg-pink-500/15 text-pink-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <Users class="w-4.5 h-4.5" /> User Management
          </button>
          
          <button 
            @click="activeSection = 'categories'; fetchCategories()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="activeSection === 'categories' ? 'bg-pink-500/15 text-pink-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <Layers class="w-4.5 h-4.5" /> Categories
          </button>
          
          <button 
            @click="activeSection = 'orders'; fetchOrders()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="activeSection === 'orders' ? 'bg-pink-500/15 text-pink-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <Truck class="w-4.5 h-4.5" /> Orders Tracking
          </button>
          
          <button 
            @click="activeSection = 'coupons'; fetchCoupons()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="activeSection === 'coupons' ? 'bg-pink-500/15 text-pink-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <Percent class="w-4.5 h-4.5" /> Discount Coupons
          </button>
          
          <button 
            @click="activeSection = 'homepage'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="activeSection === 'homepage' ? 'bg-pink-500/15 text-pink-500' : 'text-gray-600 hover:bg-gray-50'"
          >
            <Sparkles class="w-4.5 h-4.5" /> Homepage CMS
          </button>
        </nav>
      </div>

      <div class="p-6 border-t border-gray-100 text-xs text-gray-400 font-medium">
        Logged in as {{ user?.name }} (Admin)
      </div>
    </aside>

    <!-- Main Workspace Area -->
    <main class="flex-grow p-8 max-w-7xl mx-auto min-w-0">
      
      <!-- Top header banner -->
      <div class="flex justify-between items-center mb-8 border-b border-gray-250/30 pb-4">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900 capitalize tracking-tight flex items-center gap-2">
            <LayoutDashboard class="w-6 h-6 text-gray-400" />
            {{ activeSection === 'overview' ? 'Dashboard Overview' : activeSection + ' Management' }}
          </h1>
          <p class="text-xs text-gray-500 font-semibold mt-1">Hello, Administrator {{ user?.name }} &bull; System scope: Global</p>
        </div>

        <button 
          @click="refreshData" 
          class="bg-white border border-gray-200 hover:bg-gray-50 font-bold text-xs py-2 px-4 rounded shadow-sm text-gray-700 active:scale-95 transition-all cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      <!-- OVERVIEW OVERVIEW OVERVIEW -->
      <div v-if="activeSection === 'overview'" class="space-y-8">
        <!-- Summary dynamic stats row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Revenue -->
          <div class="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Revenue</span>
              <span class="text-2xl font-black text-gray-900 block">${{ stats.totalRevenue.toFixed(2) }}</span>
              <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">Dynamic Calculation</span>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
              <TrendingUp class="w-5 h-5" />
            </div>
          </div>

          <!-- Total Products -->
          <div class="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Products</span>
              <span class="text-2xl font-black text-gray-900 block">{{ stats.totalProducts }}</span>
              <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">Database Seeded</span>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
              <Package class="w-5 h-5" />
            </div>
          </div>

          <!-- Active Users -->
          <div class="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Active Users</span>
              <span class="text-2xl font-black text-gray-900 block">{{ stats.activeUsers }}</span>
              <span class="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">Non-Restricted</span>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 shrink-0">
              <Users class="w-5 h-5" />
            </div>
          </div>

          <!-- Preparing Orders -->
          <div class="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Preparing Orders</span>
              <span class="text-2xl font-black text-gray-900 block">{{ stats.pendingOrders }}</span>
              <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">Requires Packaging</span>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
              <ShoppingBag class="w-5 h-5" />
            </div>
          </div>
        </div>

        <!-- Modules Grid Quick Navigation -->
        <div class="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
          <h2 class="text-base font-bold text-gray-800 uppercase tracking-wider mb-6">Quick Navigation Administrative Modules</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Products CRUD nav -->
            <div @click="activeSection = 'products'; fetchProducts()" class="border border-gray-100 hover:border-pink-500/30 p-5 rounded-lg hover:shadow-sm transition-all cursor-pointer text-left bg-gray-50/50">
              <Package class="w-8 h-8 text-pink-500 mb-3" />
              <h3 class="text-sm font-bold text-gray-800 mb-1">Products CRUD Panel</h3>
              <p class="text-xs text-gray-450 leading-relaxed font-normal">Add new products, adjust details, or adjust stock parameters.</p>
            </div>
            <!-- Users nav -->
            <div @click="activeSection = 'users'; fetchUsers()" class="border border-gray-100 hover:border-pink-500/30 p-5 rounded-lg hover:shadow-sm transition-all cursor-pointer text-left bg-gray-50/50">
              <Users class="w-8 h-8 text-purple-600 mb-3" />
              <h3 class="text-sm font-bold text-gray-800 mb-1">User Management</h3>
              <p class="text-xs text-gray-450 leading-relaxed font-normal">Approve, restrict, or soft delete system accounts.</p>
            </div>
            <!-- Categories nav -->
            <div @click="activeSection = 'categories'; fetchCategories()" class="border border-gray-100 hover:border-pink-500/30 p-5 rounded-lg hover:shadow-sm transition-all cursor-pointer text-left bg-gray-50/50">
              <Layers class="w-8 h-8 text-blue-600 mb-3" />
              <h3 class="text-sm font-bold text-gray-800 mb-1">Categories CRUD</h3>
              <p class="text-xs text-gray-450 leading-relaxed font-normal">Refine product category labels and details.</p>
            </div>
            <!-- Orders nav -->
            <div @click="activeSection = 'orders'; fetchOrders()" class="border border-gray-100 hover:border-pink-500/30 p-5 rounded-lg hover:shadow-sm transition-all cursor-pointer text-left bg-gray-50/50">
              <Truck class="w-8 h-8 text-amber-600 mb-3" />
              <h3 class="text-sm font-bold text-gray-800 mb-1">Order Tracking</h3>
              <p class="text-xs text-gray-450 leading-relaxed font-normal">Approve order dispatch schedules and update shipments.</p>
            </div>
            <!-- Coupons nav -->
            <div @click="activeSection = 'coupons'; fetchCoupons()" class="border border-gray-100 hover:border-pink-500/30 p-5 rounded-lg hover:shadow-sm transition-all cursor-pointer text-left bg-gray-50/50">
              <Percent class="w-8 h-8 text-emerald-600 mb-3" />
              <h3 class="text-sm font-bold text-gray-800 mb-1">Discounts & Promos</h3>
              <p class="text-xs text-gray-450 leading-relaxed font-normal">Create coupon code validations and markdown sale periods.</p>
            </div>
            <!-- Homepage CMS nav -->
            <div @click="activeSection = 'homepage'" class="border border-gray-100 hover:border-pink-500/30 p-5 rounded-lg hover:shadow-sm transition-all cursor-pointer text-left bg-gray-50/50">
              <Sparkles class="w-8 h-8 text-indigo-650 mb-3" />
              <h3 class="text-sm font-bold text-gray-800 mb-1">Homepage CMS</h3>
              <p class="text-xs text-gray-450 leading-relaxed font-normal">Upload homepage carousels and change custom sales banners.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUCTS MANAGEMENT PRODUCTS MANAGEMENT -->
      <div v-else-if="activeSection === 'products'" class="space-y-6">
        <!-- Actions & Filters -->
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div class="flex flex-1 gap-3">
            <div class="relative flex-grow max-w-md">
              <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                v-model="productSearch"
                @input="fetchProducts"
                type="text" 
                placeholder="Search products by title, SKU, brand..."
                class="w-full bg-white border border-gray-250 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 transition-all"
              />
            </div>
            
            <select 
              v-model="selectedProductCategory"
              @change="fetchProducts"
              class="bg-white border border-gray-250 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            >
              <option value="">All Categories</option>
              <option v-for="cat in categoriesList" :key="cat._id" :value="cat.name">{{ cat.name }}</option>
            </select>
          </div>

          <button 
            @click="openAddProductModal"
            class="bg-pink-500 text-white font-bold text-xs py-2.5 px-6 rounded uppercase shadow hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus class="w-4 h-4" /> Add Product
          </button>
        </div>

        <!-- Products table list -->
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <th class="p-4">Thumbnail</th>
                <th class="p-4">Product Title</th>
                <th class="p-4">Category</th>
                <th class="p-4">Brand</th>
                <th class="p-4">Price</th>
                <th class="p-4 text-center">Stock</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-600 divide-y divide-gray-50">
              <tr v-for="prod in productsList" :key="prod._id" class="hover:bg-gray-50/50">
                <td class="p-4 shrink-0">
                  <div class="w-10 h-10 bg-gray-50 rounded border border-gray-100 p-0.5 flex items-center justify-center">
                    <img :src="prod.thumbnail || prod.image" alt="" class="max-w-full max-h-full object-contain" />
                  </div>
                </td>
                <td class="p-4">
                  <span class="font-bold text-gray-800 block truncate max-w-[200px]" :title="prod.title">{{ prod.title }}</span>
                  <span class="text-[10px] font-mono text-gray-400 block mt-0.5">SKU: {{ prod.sku }}</span>
                </td>
                <td class="p-4">
                  <span class="bg-pink-500/10 text-pink-500 text-xs font-bold px-2 py-0.5 rounded">
                    {{ getCategoryName(prod.category) }}
                  </span>
                </td>
                <td class="p-4 font-semibold text-gray-700">{{ prod.brand || 'N/A' }}</td>
                <td class="p-4 font-extrabold text-gray-800">${{ prod.price.toFixed(2) }}</td>
                <td class="p-4 text-center">
                  <span 
                    class="font-bold text-xs px-2.5 py-0.5 rounded-full"
                    :class="prod.stock === 0 
                      ? 'bg-red-50 text-red-650' 
                      : (prod.stock <= 5 ? 'bg-amber-50 text-amber-650' : 'bg-emerald-50 text-emerald-650')"
                  >
                    {{ prod.stock }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex justify-end gap-1.5">
                    <button 
                      @click="openEditProductModal(prod)"
                      class="p-1.5 hover:bg-pink-500/10 text-pink-500 rounded cursor-pointer transition-colors"
                      title="Edit"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button 
                      @click="handleDeleteProduct(prod._id)"
                      class="p-1.5 hover:bg-red-50 text-red-500 rounded cursor-pointer transition-colors"
                      title="Delete"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination row -->
        <div class="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">
          <span class="text-gray-400 font-medium">Page {{ productPage }} of {{ productPages }}</span>
          <div class="flex gap-2">
            <button 
              @click="productPage = Math.max(1, productPage - 1); fetchProducts()"
              :disabled="productPage === 1"
              class="border border-gray-250 py-1.5 px-3 rounded hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Previous
            </button>
            <button 
              @click="productPage = Math.min(productPages, productPage + 1); fetchProducts()"
              :disabled="productPage === productPages"
              class="border border-gray-250 py-1.5 px-3 rounded hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- USER MANAGEMENT USER MANAGEMENT -->
      <div v-else-if="activeSection === 'users'" class="space-y-6">
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <th class="p-4">Name</th>
                <th class="p-4">Email</th>
                <th class="p-4">Role</th>
                <th class="p-4">Approval</th>
                <th class="p-4">Restriction Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-600 divide-y divide-gray-50">
              <tr v-for="usr in usersList" :key="usr._id" class="hover:bg-gray-50/50">
                <td class="p-4 font-bold text-gray-800">{{ usr.name }}</td>
                <td class="p-4 font-mono text-gray-500 text-xs">{{ usr.email }}</td>
                <td class="p-4">
                  <select 
                    :value="usr.role"
                    @change="handleChangeUserRole(usr._id, ($event.target as HTMLSelectElement).value)"
                    class="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-pink-500"
                    :disabled="usr._id === user?._id"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Seller">Seller</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td class="p-4">
                  <span 
                    class="text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border"
                    :class="usr.isApproved ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-amber-100 bg-amber-50 text-amber-600'"
                  >
                    {{ usr.isApproved ? 'Approved' : 'Not Approved' }}
                  </span>
                </td>
                <td class="p-4">
                  <span 
                    class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    :class="usr.isRestricted ? 'bg-red-50 text-red-650' : 'bg-emerald-50 text-emerald-655'"
                  >
                    {{ usr.isRestricted ? 'Restricted/Blocked' : 'Active Account' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex justify-end gap-1.5">
                    <button
                      @click="handleToggleApproveUser(usr)"
                      class="p-1 px-2.5 text-xs border font-bold rounded cursor-pointer transition-all"
                      :class="usr.isApproved
                        ? 'border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
                      title="Approve/Unapprove User"
                      :disabled="usr._id === user?._id"
                    >
                      <span v-if="usr.isApproved">Unapprove</span>
                      <span v-else>Approve</span>
                    </button>
                    <button 
                      @click="handleToggleRestrictUser(usr)"
                      class="p-1 px-2.5 text-xs border font-bold rounded cursor-pointer transition-all"
                      :class="usr.isRestricted 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                        : 'border-red-100 bg-red-50 text-red-500 hover:bg-red-100'"
                      title="Restrict/Unrestrict User"
                      :disabled="usr._id === user?._id"
                    >
                      <span v-if="usr.isRestricted">Activate</span>
                      <span v-else>Restrict</span>
                    </button>
                    <button 
                      @click="handleDeleteUser(usr._id)"
                      class="p-1 px-2.5 text-xs border border-gray-200 hover:bg-red-50 text-red-550 rounded cursor-pointer transition-all"
                      title="Soft Delete User"
                      :disabled="usr._id === user?._id"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CATEGORIES CRUD CATEGORIES CRUD -->
      <div v-else-if="activeSection === 'categories'" class="space-y-6">
        <!-- Action banner -->
        <div class="flex justify-between items-center bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Categories: {{ categoriesList.length }}</span>
          <button 
            @click="openAddCategoryModal"
            class="bg-pink-500 text-white font-bold text-xs py-2.5 px-6 rounded uppercase shadow hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus class="w-4 h-4" /> Add Category
          </button>
        </div>

        <!-- Categories Table -->
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <th class="p-4">Image</th>
                <th class="p-4">Category Name</th>
                <th class="p-4">Description</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-600 divide-y divide-gray-50">
              <tr v-for="cat in categoriesList" :key="cat._id" class="hover:bg-gray-50/50">
                <td class="p-4">
                  <div class="w-10 h-10 bg-gray-50 rounded border border-gray-100 p-0.5 flex items-center justify-center">
                    <img :src="cat.image" alt="" class="max-w-full max-h-full object-cover" />
                  </div>
                </td>
                <td class="p-4 font-bold text-gray-800">{{ cat.name }}</td>
                <td class="p-4 text-xs text-gray-500 font-normal max-w-sm truncate">{{ cat.description || 'No description provided' }}</td>
                <td class="p-4 text-right">
                  <div class="flex justify-end gap-1.5">
                    <button 
                      @click="openEditCategoryModal(cat)"
                      class="p-1.5 hover:bg-pink-500/10 text-pink-500 rounded cursor-pointer transition-colors"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button 
                      @click="handleDeleteCategory(cat._id)"
                      class="p-1.5 hover:bg-red-50 text-red-500 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ORDERS TRACKING ORDERS TRACKING -->
      <div v-else-if="activeSection === 'orders'" class="space-y-6">
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <th class="p-4">Order ID</th>
                <th class="p-4">Customer</th>
                <th class="p-4">Address</th>
                <th class="p-4">Date</th>
                <th class="p-4">Amount</th>
                <th class="p-4">Status</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-600 divide-y divide-gray-50">
              <tr v-for="ord in ordersList" :key="ord._id" class="hover:bg-gray-50/50">
                <td class="p-4 font-mono text-xs font-bold text-gray-850">{{ ord._id }}</td>
                <td class="p-4">
                  <div class="font-bold text-gray-800">{{ ord.user?.name || 'Guest User' }}</div>
                  <div class="text-[10px] font-mono text-gray-400 mt-0.5">{{ ord.user?.email || '' }}</div>
                </td>
                <td class="p-4 text-xs font-medium max-w-[150px] truncate" :title="ord.shippingAddress">{{ ord.shippingAddress }}</td>
                <td class="p-4 text-xs text-gray-500">{{ new Date(ord.createdAt).toLocaleDateString() }}</td>
                <td class="p-4 font-extrabold text-gray-800">${{ ord.totalAmount.toFixed(2) }}</td>
                <td class="p-4">
                  <select 
                    :value="ord.status"
                    @change="handleUpdateOrderStatus(ord._id, ($event.target as HTMLSelectElement).value)"
                    class="bg-white border border-gray-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-pink-500 cursor-pointer"
                    :class="{
                      'text-emerald-600': ord.status === 'Delivered',
                      'text-red-500': ord.status === 'Cancelled',
                      'text-blue-600': ord.status === 'Packaged',
                      'text-purple-600': ord.status === 'In Delivery',
                      'text-amber-600': ord.status === 'Preparing'
                    }"
                  >
                    <option value="Preparing">Preparing</option>
                    <option value="Packaged">Packaged</option>
                    <option value="In Delivery">In Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DISCOUNT COUPONS DISCOUNT COUPONS -->
      <div v-else-if="activeSection === 'coupons'" class="space-y-6">
        <!-- Action banner -->
        <div class="flex justify-between items-center bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Active System Coupons</span>
          <button 
            @click="showCouponModal = true"
            class="bg-pink-500 text-white font-bold text-xs py-2.5 px-6 rounded uppercase shadow hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus class="w-4 h-4" /> Create Coupon
          </button>
        </div>

        <!-- Coupons Table -->
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <th class="p-4">Coupon Code</th>
                <th class="p-4">Discount Type</th>
                <th class="p-4">Value</th>
                <th class="p-4 text-center">Active Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-600 divide-y divide-gray-50">
              <tr v-for="coup in couponsList" :key="coup._id" class="hover:bg-gray-50/50">
                <td class="p-4 font-mono font-extrabold tracking-wider text-pink-500">{{ coup.code }}</td>
                <td class="p-4 capitalize font-semibold text-gray-600">{{ coup.discountType }}</td>
                <td class="p-4 font-bold text-gray-800">
                  {{ coup.discountType === 'percentage' ? coup.discountValue + '%' : '$' + coup.discountValue }}
                </td>
                <td class="p-4 text-center">
                  <span 
                    class="font-bold text-xs px-2.5 py-0.5 rounded-full"
                    :class="coup.isActive ? 'bg-emerald-50 text-emerald-650' : 'bg-red-50 text-red-650'"
                  >
                    {{ coup.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button 
                    @click="handleDeleteCoupon(coup._id)"
                    class="p-1.5 hover:bg-red-50 text-red-500 rounded cursor-pointer transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- HOMEPAGE CMS HOMEPAGE CMS -->
      <div v-else-if="activeSection === 'homepage'" class="space-y-6">
        <div class="bg-white border border-gray-100 rounded-lg p-8 shadow-sm text-left max-w-xl">
          <h2 class="text-base font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-1.5 border-b border-gray-100 pb-3">
            <Sparkles class="w-5 h-5 text-pink-500" /> Homepage Hero Banner Configuration
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Title Text</label>
              <input 
                v-model="homeCMSText.title"
                type="text" 
                class="w-full bg-white border border-gray-250 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Subtitle Promo</label>
              <input 
                v-model="homeCMSText.subtitle"
                type="text" 
                class="w-full bg-white border border-gray-250 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Call To Action Button Label</label>
              <input 
                v-model="homeCMSText.buttonText"
                type="text" 
                class="w-full bg-white border border-gray-250 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 transition-all"
              />
            </div>

            <button 
              @click="handleSaveHomepageCMS"
              class="w-full bg-pink-500 text-white font-bold text-xs tracking-wider py-3.5 px-6 rounded uppercase shadow hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Update Banner Content
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- PRODUCT MODAL PRODUCT MODAL PRODUCT MODAL -->
    <div v-if="showProductModal" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-150 text-left flex flex-col max-h-[90vh]">
        <!-- header -->
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 capitalize">{{ isEditing ? 'Edit Product Parameters' : 'Add New Product' }}</h3>
          <button @click="showProductModal = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>

        <!-- content scroll -->
        <div class="p-6 overflow-y-auto space-y-4 flex-grow text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Title</label>
              <input v-model="productForm.title" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
              <textarea v-model="productForm.description" rows="3" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3"></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price ($)</label>
              <input v-model.number="productForm.price" type="number" step="0.01" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount percentage (%)</label>
              <input v-model.number="productForm.discountPercentage" type="number" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock quantity</label>
              <input v-model.number="productForm.stock" type="number" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
              <select v-model="productForm.category" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3">
                <option v-for="cat in categoriesList" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Brand Name</label>
              <input v-model="productForm.brand" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">SKU identifier</label>
              <input v-model="productForm.sku" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div class="col-span-2">
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Thumbnail image URL</label>
              <input v-model="productForm.thumbnail" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Warranty details</label>
              <input v-model="productForm.warrantyInformation" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping details</label>
              <input v-model="productForm.shippingInformation" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
            </div>

            <div class="flex items-center gap-3 mt-4 col-span-2">
              <label class="flex items-center gap-2 select-none cursor-pointer">
                <input v-model="productForm.isFeatured" type="checkbox" class="accent-pink-500 cursor-pointer" /> Featured product
              </label>

              <label class="flex items-center gap-2 select-none cursor-pointer">
                <input v-model="productForm.isOnSale" type="checkbox" class="accent-pink-500 cursor-pointer" /> On Sale promo
              </label>
            </div>
          </div>
        </div>

        <!-- footer action -->
        <div class="p-6 border-t border-gray-100 bg-gray-55 flex justify-end gap-3">
          <button @click="showProductModal = false" class="border border-gray-200 hover:bg-gray-50 py-2 px-4 rounded text-xs font-bold uppercase transition-all">Cancel</button>
          <button 
            @click="handleSaveProduct" 
            :disabled="actionLoading"
            class="bg-pink-500 text-white py-2 px-6 rounded text-xs font-bold uppercase hover:opacity-95 shadow flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="actionLoading" class="w-3.5 h-3.5 animate-spin" />
            Save changes
          </button>
        </div>
      </div>
    </div>

    <!-- CATEGORY MODAL CATEGORY MODAL CATEGORY MODAL -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden border border-gray-150 text-left flex flex-col">
        <!-- header -->
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 capitalize">{{ isEditing ? 'Edit Category' : 'Add New Category' }}</h3>
          <button @click="showCategoryModal = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>

        <!-- form content -->
        <div class="p-6 space-y-4 text-sm">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Name</label>
            <input v-model="categoryForm.name" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Image URL</label>
            <input v-model="categoryForm.image" type="text" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <textarea v-model="categoryForm.description" rows="3" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3"></textarea>
          </div>
        </div>

        <!-- footer action -->
        <div class="p-6 border-t border-gray-100 bg-gray-55 flex justify-end gap-3">
          <button @click="showCategoryModal = false" class="border border-gray-200 hover:bg-gray-50 py-2 px-4 rounded text-xs font-bold uppercase transition-all">Cancel</button>
          <button 
            @click="handleSaveCategory" 
            :disabled="actionLoading"
            class="bg-pink-500 text-white py-2 px-6 rounded text-xs font-bold uppercase hover:opacity-95 shadow flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="actionLoading" class="w-3.5 h-3.5 animate-spin" />
            Save Category
          </button>
        </div>
      </div>
    </div>

    <!-- COUPON MODAL COUPON MODAL COUPON MODAL -->
    <div v-if="showCouponModal" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden border border-gray-150 text-left flex flex-col">
        <!-- header -->
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 capitalize">Create Discount Coupon</h3>
          <button @click="showCouponModal = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>

        <!-- form content -->
        <div class="p-6 space-y-4 text-sm">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Coupon Code (Uppercase)</label>
            <input v-model="couponForm.code" type="text" placeholder="E.G. SUMMER20" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3 uppercase font-mono font-bold" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Type</label>
            <select v-model="couponForm.discountType" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Value</label>
            <input v-model.number="couponForm.discountValue" type="number" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expiration Date (Optional)</label>
            <input v-model="couponForm.expirationDate" type="date" class="w-full bg-white border border-gray-250 rounded-md py-2 px-3 font-semibold" />
          </div>
        </div>

        <!-- footer action -->
        <div class="p-6 border-t border-gray-100 bg-gray-55 flex justify-end gap-3">
          <button @click="showCouponModal = false" class="border border-gray-200 hover:bg-gray-50 py-2 px-4 rounded text-xs font-bold uppercase transition-all">Cancel</button>
          <button 
            @click="handleCreateCoupon" 
            :disabled="actionLoading || !couponForm.code || !couponForm.discountValue"
            class="bg-pink-500 text-white py-2 px-6 rounded text-xs font-bold uppercase hover:opacity-95 shadow flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="actionLoading" class="w-3.5 h-3.5 animate-spin" />
            Create Coupon
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
