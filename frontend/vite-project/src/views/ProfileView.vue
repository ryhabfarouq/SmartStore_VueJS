<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { User, Phone, MapPin, Mail, Shield, Save, CheckCircle, AlertCircle, Loader2, ShoppingBag, Calendar } from 'lucide-vue-next'

const { user, updateProfile } = useAuth()

// State
const form = reactive({
  name: user.value?.name || '',
  phone: user.value?.phone || '',
  address: user.value?.address || ''
})

const errors = reactive({
  name: '',
  general: ''
})

const loading = ref(false)
const successMessage = ref('')

const validateForm = () => {
  errors.name = ''
  errors.general = ''
  
  if (!form.name.trim()) {
    errors.name = 'Full name is required'
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  successMessage.value = ''
  errors.general = ''
  
  try {
    await updateProfile({
      name: form.name,
      phone: form.phone,
      address: form.address
    })
    successMessage.value = 'Profile updated successfully!'
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('Profile update error:', err)
    errors.general = err.message || 'Failed to update profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Sync form with user state in case it loads later (e.g. after refresh check)
onMounted(() => {
  if (user.value) {
    form.name = user.value.name
    form.phone = user.value.phone || ''
    form.address = user.value.address || ''
  }
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
    
    <!-- Breadcrumb -->
    <div class="flex items-center text-xs text-gray-500 gap-1.5 uppercase font-medium tracking-wide mb-8">
      <router-link to="/" class="hover:text-pink-500 transition-colors">Home</router-link>
      <span>/</span>
      <span class="text-gray-900 font-semibold">User Profile</span>
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

      <!-- Profile Edit Form -->
      <div class="lg:col-span-2 bg-white border border-gray-100 p-6 sm:p-8 rounded-lg shadow-sm text-left">
        <h2 class="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
          Edit Account Details
        </h2>

        <!-- Alert messages -->
        <div 
          v-if="successMessage" 
          class="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded flex gap-2"
        >
          <CheckCircle class="w-5 h-5 text-emerald-500 shrink-0" />
          <div class="text-sm text-emerald-700 font-semibold">{{ successMessage }}</div>
        </div>

        <div 
          v-if="errors.general" 
          class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex gap-2"
        >
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
          <div class="text-sm text-red-700 font-medium">{{ errors.general }}</div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Full Name -->
          <div>
            <label for="name" class="block text-sm font-semibold text-gray-700">Full Name</label>
            <div class="mt-1 relative rounded shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User class="h-4.5 w-4.5 text-gray-400" />
              </div>
              <input 
                id="name" 
                v-model="form.name"
                type="text" 
                class="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                :class="errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''"
              />
            </div>
            <p v-if="errors.name" class="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.name }}
            </p>
          </div>

          <!-- Phone Number -->
          <div>
            <label for="phone" class="block text-sm font-semibold text-gray-700">Phone Number</label>
            <div class="mt-1 relative rounded shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone class="h-4.5 w-4.5 text-gray-400" />
              </div>
              <input 
                id="phone" 
                v-model="form.phone"
                type="text" 
                class="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <!-- Address -->
          <div>
            <label for="address" class="block text-sm font-semibold text-gray-700">Delivery Address</label>
            <div class="mt-1 relative rounded shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin class="h-4.5 w-4.5 text-gray-400" />
              </div>
              <input 
                id="address" 
                v-model="form.address"
                type="text" 
                class="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                placeholder="123 Street, City, Country"
              />
            </div>
          </div>

          <!-- Action Button -->
          <div class="border-t border-gray-100 pt-6 flex justify-end">
            <button 
              type="submit" 
              :disabled="loading"
              class="bg-pink-500 text-white font-bold text-sm tracking-wide py-3 px-8 rounded-md shadow-sm hover:opacity-95 active:scale-[0.99] transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="loading" class="w-4.5 h-4.5 animate-spin" />
              <Save v-else class="w-4.5 h-4.5" />
              <span>{{ loading ? 'Saving Changes...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>
