<script setup lang="ts">
import ContactDetails from '../components/ContactDetails.vue'
import StoresSection from '../components/StoresSection.vue'
import ReviewsSection from '../components/ReviewsSection.vue'
import BrandsSection from '../components/BrandsSection.vue'
</script>

<template>
  <div class="leading-relaxed">
    <!-- Breadcrumb Hero Section -->
    <section class="bg-gray-50 text-center py-16 mb-16 w-full">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
        <h1 class="text-4xl font-medium tracking-wider mb-2 text-gray-900 uppercase">Contact</h1>
        <p class="text-gray-500 text-sm">
          <router-link to="/" class="hover:text-pink-500 transition-colors">Home</router-link> 
          <span class="mx-2">&gt;</span> 
          <router-link to="/shop" class="text-gray-400 hover:text-pink-500 transition-colors">Shop</router-link>
        </p>
      </div>
    </section>

    <!-- Main Contact details and form section -->
    <ContactDetails />

    <!-- Our Stores Section -->
    <StoresSection />

    <!-- Customers Reviews Section -->
    <ReviewsSection />

    <!-- Brand Logos Section -->
    <BrandsSection />
  </div>
</template>