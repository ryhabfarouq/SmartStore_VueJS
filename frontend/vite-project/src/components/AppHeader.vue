<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, X, LogOut } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'

const router = useRouter()
const { isAuthenticated, isAdmin, logout, user } = useAuth()
const { itemsCount } = useCart()
const isMobileMenuOpen = ref(false)

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="font-sans bg-white border-b border-gray-100">
    <!-- Top thin bar -->
    <div class="border-b border-gray-100 text-xs text-gray-500 py-2 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2 sm:gap-0">
        <div>Need help? Call us: 1122334455</div>
        <div>
          <span v-if="isAuthenticated" class="font-semibold text-gray-700">
            Welcome back, {{ user?.name }} ({{ user?.role }})!
          </span>
          <span v-else>
            Summer sale discount off 50%! <router-link to="/shop" class="underline font-medium text-gray-800 hover:text-pink-500">Shop Now</router-link>
          </span>
        </div>
        <div>2-3 business days delivery & free returns</div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 flex justify-between items-center py-6 gap-4 relative">
      <!-- Logo -->
      <div class="text-2xl font-bold tracking-wide text-gray-900">
        <router-link to="/" >SMART<span class="text-pink-500 font-light">STORE</span></router-link>
      </div>

      <!-- Navigation for Large Screens -->
      <nav class="hidden lg:block">
        <ul class="flex gap-8 text-sm font-medium tracking-wide">
          <!-- Public Guest Navigation -->
          <template v-if="!isAuthenticated">
            <li><router-link to="/" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">HOME</router-link></li>
            <li><router-link to="/about" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">ABOUT</router-link></li>
            <li><router-link to="/shop" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">SHOP</router-link></li>
            <li><router-link to="/contact" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">CONTACT</router-link></li>
            <li><router-link to="/login" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">LOGIN</router-link></li>
            <li><router-link to="/register" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">REGISTER</router-link></li>
          </template>

          <!-- Authenticated Regular User Navigation -->
          <template v-else-if="isAuthenticated && !isAdmin">
            <li><router-link to="/" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">HOME</router-link></li>
            <li><router-link to="/shop" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">SHOP</router-link></li>
            <li><router-link to="/cart" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">CART</router-link></li>
            <li><router-link to="/profile" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">PROFILE</router-link></li>
          </template>

          <!-- Authenticated Admin Navigation -->
          <template v-else-if="isAuthenticated && isAdmin">
            <li><router-link to="/" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">HOME</router-link></li>
            <li><router-link to="/shop" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">SHOP</router-link></li>
            <li><router-link to="/admin" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">ADMIN DASHBOARD</router-link></li>
            <li><router-link to="/profile" class="hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 border-b-2 border-pink-500 pb-1">PROFILE</router-link></li>
          </template>
        </ul>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-5 text-gray-800">
        <!-- Search anchor / SVG -->
        <router-link to="/shop" class="hover:text-pink-500 transition-colors" aria-label="Search">
          <svg class="w-5 h-5 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </router-link>

        <!-- Profile Link -->
        <router-link :to="isAuthenticated ? '/profile' : '/login'" class="hover:text-pink-500 transition-colors" aria-label="Profile">
          <svg class="w-5 h-5 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </router-link>

        <!-- Favorites (Users only) -->
        <router-link v-if="isAuthenticated && !isAdmin" to="/favorites" class="hover:text-pink-500 transition-colors" aria-label="Favorites">
          <svg class="w-5 h-5 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </router-link>

        <!-- Cart -->
        <router-link v-if="isAuthenticated && !isAdmin" to="/cart" class="hover:text-pink-500 transition-colors relative" aria-label="Shopping Cart">
          <svg class="w-5 h-5 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span v-if="itemsCount > 0" class="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center border border-white">
            {{ itemsCount }}
          </span>
        </router-link>
        
        <!-- Logout action (for authenticated users) -->
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="hidden sm:flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-pink-500 transition-colors cursor-pointer uppercase bg-transparent border-0 outline-none"
          title="Sign Out"
        >
          <LogOut class="w-4 h-4" /> <span class="hidden md:inline">Sign Out</span>
        </button>

        <!-- Burger menu icon (visible on mobile/tablet) -->
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen" 
          class="lg:hidden p-1 text-gray-800 hover:text-pink-500 transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </header>

    <!-- Mobile Navigation Dropdown -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-96 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-96 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div 
        v-if="isMobileMenuOpen" 
        class="lg:hidden border-b border-gray-200 bg-white overflow-hidden"
      >
        <ul class="flex flex-col px-6 py-4 space-y-3 text-sm font-medium tracking-wide">
          <!-- Mobile Guest Navigation -->
          <template v-if="!isAuthenticated">
            <li><router-link to="/" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">HOME</router-link></li>
            <li><router-link to="/about" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">ABOUT</router-link></li>
            <li><router-link to="/shop" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">SHOP</router-link></li>
            <li><router-link to="/contact" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">CONTACT</router-link></li>
            <li><router-link to="/login" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">LOGIN</router-link></li>
            <li><router-link to="/register" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">REGISTER</router-link></li>
          </template>

          <!-- Mobile Regular User Navigation -->
          <template v-else-if="isAuthenticated && !isAdmin">
            <li><router-link to="/" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">HOME</router-link></li>
            <li><router-link to="/shop" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">SHOP</router-link></li>
            <li>
              <router-link to="/cart" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">
                CART <span v-if="itemsCount > 0">({{ itemsCount }})</span>
              </router-link>
            </li>
            <li><router-link to="/profile" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">PROFILE</router-link></li>
            <li><button @click="handleLogout(); isMobileMenuOpen = false" class="w-full text-left block py-1 text-gray-600 hover:text-pink-500 font-semibold uppercase">LOGOUT</button></li>
          </template>

          <!-- Mobile Admin Navigation -->
          <template v-else-if="isAuthenticated && isAdmin">
            <li><router-link to="/" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">HOME</router-link></li>
            <li><router-link to="/shop" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">SHOP</router-link></li>
            <li><router-link to="/admin" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">ADMIN DASHBOARD</router-link></li>
            <li><router-link to="/profile" @click="isMobileMenuOpen = false" class="block py-1 hover:text-pink-500 transition-colors" exact-active-class="text-pink-500 font-semibold">PROFILE</router-link></li>
            <li><button @click="handleLogout(); isMobileMenuOpen = false" class="w-full text-left block py-1 text-gray-600 hover:text-pink-500 font-semibold uppercase">LOGOUT</button></li>
          </template>
        </ul>
      </div>
    </transition>
  </div>
</template>
