<script setup lang="ts">
// StoresSection.vue
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 mb-20">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      
      <!-- Left Column: Modern Workspace Image -->
      <div class="lg:col-span-5">
        <div class="relative overflow-hidden rounded bg-gray-100 aspect-[4/3] w-full">
          <img 
            src="/contact_stores.png" 
            alt="Our Stores Desk Setup" 
            class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      <!-- Right Column: Store Locations Info -->
      <div class="lg:col-span-7">
        <h2 class="text-xl font-medium tracking-wider text-gray-900 mb-2 uppercase">Our Stores</h2>
        <p class="text-sm text-gray-500 mb-8 leading-relaxed">
          You can also directly buy products from our stores.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
          <!-- USA Store Card -->
          <div>
            <h3 class="text-xs font-semibold tracking-widest text-gray-900 mb-3 uppercase">USA</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">
              730 Glenstone Ave 65802, Springfield, US
            </p>
            <p class="text-sm text-gray-500 leading-relaxed">
              <a href="tel:+12366677788" class="block hover:text-pink-500 transition-colors">+123 666 777 88</a>
              <a href="mailto:info@yourinfo.com" class="block hover:text-pink-500 transition-colors underline">info@yourinfo.com</a>
            </p>
          </div>

          <!-- France Store Card -->
          <div>
            <h3 class="text-xs font-semibold tracking-widest text-gray-900 mb-3 uppercase">France</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">
              13 Rue Montmartre 75001, Paris, France
            </p>
            <p class="text-sm text-gray-500 leading-relaxed">
              <a href="tel:+12322233344" class="block hover:text-pink-500 transition-colors">+123 222 333 44</a>
              <a href="mailto:info@yourinfo.com" class="block hover:text-pink-500 transition-colors underline">info@yourinfo.com</a>
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
