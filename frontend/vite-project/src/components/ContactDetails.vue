<script setup lang="ts">
import { ref } from 'vue'
import { API_BASE_URL } from '../config'

// Define the reactive form state
const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

// Control the visibility of alerts and submission state
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

// Handle the contact form submission via backend API
const handleSubmit = async () => {
  isSubmitting.value = true
  showSuccess.value = false
  showError.value = false
  errorMessage.value = ''

  try {
    const res = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong. Please try again.')
    }

    // Success behavior
    showSuccess.value = true
    
    // Reset the form fields
    form.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }

    // Auto-hide the success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
  } catch (error: any) {
    console.error('Error submitting contact form:', error)
    showError.value = true
    errorMessage.value = error.message || 'Failed to submit message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 mb-20">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      
      <!-- Left Column: Contact Details -->
      <div class="lg:col-span-5 flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-medium tracking-wider text-gray-900 mb-4 uppercase">Contact Info</h2>
          <p class="text-sm text-gray-500 mb-10 leading-relaxed max-w-md">
            Tortor dignissim convallis aenean et tortor at risus viverra adipiscing.
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            <!-- Office Address Card -->
            <div>
              <h3 class="text-xs font-semibold tracking-widest text-gray-900 mb-3 uppercase">Office</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-3">
                730 Glenstone Ave 65802, Springfield, US
              </p>
              <p class="text-sm text-gray-500 leading-relaxed">
                <a href="tel:+12322233344" class="block hover:text-pink-500 transition-colors">+123 222 333 44</a>
                <a href="mailto:info@yourinfo.com" class="block hover:text-pink-500 transition-colors underline">info@yourinfo.com</a>
              </p>
            </div>

            <!-- Management Address Card -->
            <div>
              <h3 class="text-xs font-semibold tracking-widest text-gray-900 mb-3 uppercase">Management</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-3">
                730 Glenstone Ave 65802, Springfield, US
              </p>
              <p class="text-sm text-gray-500 leading-relaxed">
                <a href="tel:+12366677788" class="block hover:text-pink-500 transition-colors">+123 666 777 88</a>
                <a href="mailto:info@yourinfo.com" class="block hover:text-pink-500 transition-colors underline">info@yourinfo.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Contact Form -->
      <div class="lg:col-span-7">
        <h2 class="text-xl font-medium tracking-wider text-gray-900 mb-2 uppercase">Any Questions?</h2>
        <p class="text-sm text-gray-500 mb-8 leading-relaxed">
          Use the form below to get in touch with us.
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Row 1: Name and Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input 
                type="text" 
                v-model="form.name" 
                placeholder="Your full name *" 
                required 
                class="w-full border border-gray-200 py-3.5 px-4 rounded text-sm text-gray-800 placeholder-gray-400 focus:border-pink-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <input 
                type="email" 
                v-model="form.email" 
                placeholder="Write your email here *" 
                required 
                class="w-full border border-gray-200 py-3.5 px-4 rounded text-sm text-gray-800 placeholder-gray-400 focus:border-pink-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <!-- Row 2: Phone -->
          <div>
            <input 
              type="tel" 
              v-model="form.phone" 
              placeholder="Phone number" 
              class="w-full border border-gray-200 py-3.5 px-4 rounded text-sm text-gray-800 placeholder-gray-400 focus:border-pink-500 focus:ring-0 focus:outline-none transition-colors"
            />
          </div>

          <!-- Row 3: Subject -->
          <div>
            <input 
              type="text" 
              v-model="form.subject" 
              placeholder="Write your subject here" 
              class="w-full border border-gray-200 py-3.5 px-4 rounded text-sm text-gray-800 placeholder-gray-400 focus:border-pink-500 focus:ring-0 focus:outline-none transition-colors"
            />
          </div>

          <!-- Row 4: Message -->
          <div>
            <textarea 
              v-model="form.message" 
              placeholder="Write your message here *" 
              rows="5" 
              required 
              class="w-full border border-gray-200 py-3.5 px-4 rounded text-sm text-gray-800 placeholder-gray-400 focus:border-pink-500 focus:ring-0 focus:outline-none transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Success Alert -->
          <transition 
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div 
              v-if="showSuccess" 
              class="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded flex items-center gap-2"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Message submitted successfully! We'll be in touch shortly.</span>
            </div>
          </transition>

          <!-- Error Alert -->
          <transition 
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div 
              v-if="showError" 
              class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </transition>

          <!-- Submit Button -->
          <div class="pt-2">
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="bg-pink-500 text-white py-3.5 px-8 text-xs font-semibold tracking-widest uppercase rounded hover:bg-pink-500/90 transition-colors cursor-pointer w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </form>
      </div>

    </div>
  </section>
</template>
