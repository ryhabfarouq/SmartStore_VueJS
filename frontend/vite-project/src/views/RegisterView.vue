<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, MapPin, Loader2, AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { register } = useAuth()

// State
const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
})
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  general: ''
})
const loading = ref(false)
const showPassword = ref(false)

// Validation
const validateForm = () => {
  let isValid = true
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.general = ''

  if (!form.name.trim()) {
    errors.name = 'Full name is required'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'Email address is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

// Handle Submit
const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address
    })
    
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (err: any) {
    console.error('Registration error:', err)
    errors.general = err.message || 'Registration failed. Please check your inputs.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900">
        Create a new account
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Or
        <router-link to="/login" class="font-medium text-pink-500 hover:text-pink-500/90 hover:underline">
          sign in to your existing account
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-sm border border-gray-100 rounded-lg sm:px-10">
        
        <!-- General error message -->
        <div 
          v-if="errors.general" 
          class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-left flex gap-2"
        >
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
          <div class="text-sm text-red-700 font-medium">{{ errors.general }}</div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
          
          <!-- Full Name -->
          <div>
            <label for="name" class="block text-sm font-semibold text-gray-700">Full Name</label>
            <div class="mt-1 relative rounded shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon class="h-4.5 w-4.5 text-gray-400" />
              </div>
              <input 
                id="name" 
                v-model="form.name"
                type="text" 
                class="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                :class="errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''"
                placeholder="John Doe"
              />
            </div>
            <p v-if="errors.name" class="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.name }}
            </p>
          </div>

          <!-- Email Address -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700">Email Address</label>
            <div class="mt-1 relative rounded shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail class="h-4.5 w-4.5 text-gray-400" />
              </div>
              <input 
                id="email" 
                v-model="form.email"
                type="text" 
                class="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                :class="errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''"
                placeholder="you@example.com"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.email }}
            </p>
          </div>

          <!-- Phone Number -->
          <div>
            <label for="phone" class="block text-sm font-semibold text-gray-700">Phone Number (Optional)</label>
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
            <label for="address" class="block text-sm font-semibold text-gray-700">Delivery Address (Optional)</label>
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

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700">Password</label>
            <div class="mt-1 relative rounded shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-4.5 w-4.5 text-gray-400" />
              </div>
              <input 
                id="password" 
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'" 
                class="w-full bg-white border border-gray-200 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                :class="errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button 
                  type="button"
                  @click="showPassword = !showPassword" 
                  class="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  <Eye v-if="showPassword" class="h-4.5 w-4.5" />
                  <EyeOff v-else class="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.password }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-700">Confirm Password</label>
            <div class="mt-1 relative rounded shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock class="h-4.5 w-4.5 text-gray-400" />
              </div>
              <input 
                id="confirmPassword" 
                v-model="form.confirmPassword"
                type="password" 
                class="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                :class="errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full bg-pink-500 text-white font-bold text-sm tracking-wide py-3 px-4 rounded-md shadow-sm hover:opacity-95 active:scale-[0.99] transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span>{{ loading ? 'Creating Account...' : 'Register Account' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>
