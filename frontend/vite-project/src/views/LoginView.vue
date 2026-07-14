<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

// State
const form = reactive({
  email: '',
  password: ''
})
const errors = reactive({
  email: '',
  password: '',
  general: ''
})
const loading = ref(false)
const showPassword = ref(false)

// Client-side Validation
const validateForm = () => {
  let isValid = true
  errors.email = ''
  errors.password = ''
  errors.general = ''

  // Email check
  if (!form.email) {
    errors.email = 'Email address is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Password check
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

// Handle Submit
const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    await login(form.email, form.password)
    
    // Redirect to intended route or default to home/shop
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (err: any) {
    console.error('Login error:', err)
    errors.general = err.message || 'Invalid email or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Or
        <router-link :to="{ path: '/register', query: { redirect: route.query.redirect } }" class="font-medium text-pink-500 hover:text-pink-500/90 hover:underline">
          register a new account
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

        <form @submit.prevent="handleSubmit" class="space-y-6 text-left">
          
          <!-- Email field -->
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
            <p v-if="errors.email" class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.email }}
            </p>
          </div>

          <!-- Password field -->
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
            <p v-if="errors.password" class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> {{ errors.password }}
            </p>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-between text-xs">
            <label class="flex items-center gap-2 text-gray-600 select-none cursor-pointer">
              <input type="checkbox" class="accent-pink-500 rounded cursor-pointer" /> Remember me
            </label>
          </div>

          <!-- Submit Button -->
          <div>
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full bg-pink-500 text-white font-bold text-sm tracking-wide py-3 px-4 rounded-md shadow-sm hover:opacity-95 active:scale-[0.99] transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>
