<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShieldAlert } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="bg-white border border-gray-100 p-10 rounded-lg shadow-sm max-w-md w-full text-center">
      <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldAlert class="w-10 h-10" />
      </div>
      
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
        403 Forbidden
      </h1>
      
      <p class="text-gray-500 text-sm mb-8 leading-relaxed">
        Access Denied. You do not have the required administrator permissions to view this dashboard or resource.
      </p>

      <div class="flex flex-col gap-3">
        <router-link 
          to="/" 
          class="bg-pink-500 text-white font-bold text-sm tracking-wide py-3 px-6 rounded-md shadow hover:opacity-95 active:scale-95 transition-all inline-block"
        >
          Go Back Home
        </router-link>
        <button 
          @click="router.back()" 
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm tracking-wide py-3 px-6 rounded-md active:scale-95 transition-all inline-block"
        >
          Go to Previous Page
        </button>
      </div>
    </div>
  </div>
</template>
