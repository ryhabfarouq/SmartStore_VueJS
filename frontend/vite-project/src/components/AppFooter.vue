<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { Truck, Plane, CreditCard, Landmark, Wallet } from 'lucide-vue-next'

const { isAuthenticated, isAdmin } = useAuth()
</script>

<template>
  <footer class="border-t border-gray-200 pt-16 text-sm w-full mt-auto font-sans bg-white">
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
      <div class="lg:col-span-5 text-left">
        <div class="text-xl font-bold tracking-wide mb-4 text-gray-900">SMART<span class="font-light text-pink-500">STORE</span></div>
        <p class="text-gray-500 mb-6 leading-relaxed font-normal">
          SmartStore is your premium destination for high-quality electronics, smart accessories, premium gadgets, and lifestyle essentials. Discover the latest collections with fast delivery and a secure shopping experience.
        </p>
      </div>
      
      <div class="lg:col-span-3 text-left">
        <h4 class="text-base font-semibold mb-5 tracking-wide text-gray-900">QUICK LINKS</h4>
        <ul class="space-y-3 font-medium">
          <li><router-link to="/" class="text-gray-500 hover:text-pink-500 transition-colors">HOME</router-link></li>
          <li><router-link to="/shop" class="text-gray-500 hover:text-pink-500 transition-colors">SHOP</router-link></li>
          <li><router-link to="/about" class="text-gray-500 hover:text-pink-500 transition-colors">ABOUT</router-link></li>
          <li><router-link to="/contact" class="text-gray-500 hover:text-pink-500 transition-colors">CONTACT</router-link></li>
          <li v-if="isAuthenticated && !isAdmin"><router-link to="/cart" class="text-gray-500 hover:text-pink-500 transition-colors">CART</router-link></li>
          <li v-if="isAuthenticated"><router-link to="/profile" class="text-gray-500 hover:text-pink-500 transition-colors">PROFILE</router-link></li>
          <li v-if="isAuthenticated && isAdmin"><router-link to="/admin" class="text-gray-500 hover:text-pink-500 transition-colors text-red-655 font-bold">ADMIN DASHBOARD</router-link></li>
        </ul>
      </div>

      <div class="lg:col-span-4 text-left">
        <h4 class="text-base font-semibold mb-5 tracking-wide text-gray-900">CONTACT US</h4>
        <p class="text-gray-500 mb-1 font-normal">Do you have any queries or suggestions?</p>
        <a href="mailto:yourinfo@gmail.com" class="block font-medium text-gray-900 underline mb-4 hover:text-pink-500 transition-colors">yourinfo@gmail.com</a>
        <p class="text-gray-500 mb-1 font-normal">If you need support? Just give us a call.</p>
        <a href="tel:+5511122233344" class="block font-medium text-gray-900 underline hover:text-pink-500 transition-colors">+55 111 222 333 44</a>
      </div>
    </div>
    
    <div class="border-t border-gray-200 py-5 w-full">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4 md:gap-0">
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
          <span class="flex items-center gap-1.5 font-normal">We ship with: <Truck class="w-4 h-4" /><Plane class="w-4 h-4" /></span>
          <span class="flex items-center gap-1.5 font-normal">Payment options: <CreditCard class="w-4 h-4" /><Landmark class="w-4 h-4" /><Wallet class="w-4 h-4" /></span>
        </div>
        <div class="font-normal">
          © Copyright 2026 SmartStore. All Rights Reserved.
        </div>
      </div>
    </div>
  </footer>
</template>
