<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { Mail, Shield, User, ShoppingBag, Calendar, Loader2, AlertCircle } from 'lucide-vue-next'
import { API_BASE_URL } from '../config'

const { user, token } = useAuth()

const orders = ref<any[]>([])
const loading = ref(true)
const errorMsg = ref('')

const fetchOrders = async () => {
  if (!token.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    if (!res.ok) {
      throw new Error('Failed to fetch orders')
    }
    const data = await res.json()
    // Filter completed or cancelled orders
    orders.value = data.filter((order: any) => 
      ['Delivered', 'Cancelled'].includes(order.status)
    )
  } catch (err: any) {
    console.error('Error fetching orders:', err)
    errorMsg.value = err.message || 'Something went wrong while loading order history.'
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchOrders()
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
      <span class="text-gray-900 font-semibold">Order History</span>
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

      <!-- Order History Main Content -->
      <div class="lg:col-span-2 bg-white border border-gray-100 p-6 sm:p-8 rounded-lg shadow-sm text-left">
        <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            Completed & Historical Orders
          </h2>
          <button 
            @click="fetchOrders" 
            class="text-xs font-semibold text-pink-500 hover:underline bg-transparent border-0 cursor-pointer outline-none"
          >
            Refresh List
          </button>
        </div>

        <div v-if="loading" class="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 class="w-8 h-8 animate-spin text-pink-500" />
          <span class="text-sm font-medium">Retrieving order history from database...</span>
        </div>

        <div v-else-if="errorMsg" class="bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-2 mb-6">
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
          <div class="text-sm text-red-700 font-medium">{{ errorMsg }}</div>
        </div>

        <div v-else-if="orders.length === 0" class="py-16 text-center">
          <div class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">No historical orders</h3>
          <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            You don't have any past delivered or cancelled orders in your account records.
          </p>
        </div>

        <div v-else class="space-y-6">
          <div 
            v-for="order in orders" 
            :key="order._id" 
            class="border border-gray-100 rounded-lg overflow-hidden shadow-sm"
          >
            <!-- Order Header Summary -->
            <div class="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 text-xs">
              <div class="space-y-1">
                <span class="text-gray-400 font-bold uppercase tracking-wider block">Order ID</span>
                <span class="font-mono text-gray-800 font-bold">{{ order._id }}</span>
              </div>
              <div class="space-y-1">
                <span class="text-gray-400 font-bold uppercase tracking-wider block">Date Placed</span>
                <span class="text-gray-800 font-semibold">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="space-y-1">
                <span class="text-gray-400 font-bold uppercase tracking-wider block">Total Amount</span>
                <span class="text-gray-900 font-bold text-sm">${{ order.totalAmount.toFixed(2) }}</span>
              </div>
              <div>
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  :class="getStatusColor(order.status)"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>

            <!-- Order Items -->
            <div class="p-6 divide-y divide-gray-100">
              <div 
                v-for="item in order.items" 
                :key="item._id" 
                class="py-4 first:pt-0 last:pb-0 flex gap-4 items-center"
              >
                <img 
                  :src="item.product?.thumbnail || item.product?.image || 'https://via.placeholder.com/150'" 
                  :alt="item.product?.title || 'Product Image'"
                  class="w-14 h-14 object-cover rounded border border-gray-100 bg-gray-50 shrink-0"
                />
                <div class="flex-grow min-w-0 text-sm">
                  <h4 class="font-semibold text-gray-900 truncate">
                    {{ item.product?.title || item.product?.name || 'Product deleted or unavailable' }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Qty: {{ item.quantity }} × ${{ item.price.toFixed(2) }}
                  </p>
                </div>
                <div class="text-sm font-bold text-gray-900">
                  ${{ (item.quantity * item.price).toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Shipping Info & Status detail -->
            <div class="bg-gray-50/50 px-6 py-4 border-t border-gray-100 text-xs flex flex-wrap justify-between items-start gap-4">
              <div class="space-y-1 max-w-md">
                <span class="text-gray-400 font-bold uppercase tracking-wider block">Shipping Address</span>
                <span class="text-gray-700 leading-relaxed font-medium">{{ order.shippingAddress }}</span>
              </div>
              <div class="space-y-1">
                <span class="text-gray-400 font-bold uppercase tracking-wider block">Payment Details</span>
                <div class="flex items-center gap-1.5 font-medium text-gray-700">
                  <span class="uppercase font-bold text-[10px] text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded">
                    {{ order.paymentMethod }}
                  </span>
                  <span 
                    class="capitalize font-semibold text-[11px]"
                    :class="order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'"
                  >
                    {{ order.paymentStatus }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
