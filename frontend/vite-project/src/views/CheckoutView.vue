<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, ShoppingBag } from 'lucide-vue-next'
import { useCart } from '../composables/useCart'
import { useAuth } from '../composables/useAuth'

import CheckoutBillingForm, { type BillingFormState } from '../components/CheckoutBillingForm.vue'
import CheckoutAdditionalInfo from '../components/CheckoutAdditionalInfo.vue'
import CheckoutOrderSummary from '../components/CheckoutOrderSummary.vue'
import StripePayment from '../components/StripePayment.vue'
import ReviewsSection from '../components/ReviewsSection.vue'
import LatestPostsSection from '../components/LatestPostsSection.vue'
import BrandsSection from '../components/BrandsSection.vue'
import InstagramSection from '../components/InstagramSection.vue'
import { API_BASE_URL } from '../config'

const router = useRouter()
const { user } = useAuth()
const { 
  cartItems, 
  subtotal, 
  discountAmount, 
  total, 
  checkoutSuccess, 
  checkoutError, 
  orderDetails, 
  submitCheckout,
  confirmStripeSuccess,
  resetCheckout
} = useCart()

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref<BillingFormState>({
  firstName: '',
  lastName: '',
  companyName: '',
  country: 'United States (US)',
  streetAddress: '',
  apartment: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: ''
})

const orderNotes = ref('')

// Stripe payment refs
const stripePublishableKey = ref('')
const stripeClientSecret = ref('')
const showStripePayment = ref(false)
const pendingOrder = ref<any>(null)

// Prefill form and load stripe key on mount
onMounted(() => {
  resetCheckout()
  prefillForm()
  fetchStripeKey()
})

// Watch user profile in case it loads asynchronously
watch(user, () => {
  prefillForm()
}, { immediate: true })

function prefillForm() {
  if (user.value) {
    const names = user.value.name.split(' ')
    if (!form.value.firstName) form.value.firstName = names[0] || ''
    if (!form.value.lastName) form.value.lastName = names.slice(1).join(' ') || ''
    if (!form.value.email) form.value.email = user.value.email || ''
    if (!form.value.phone && user.value.phone) form.value.phone = user.value.phone
    if (!form.value.streetAddress && user.value.address) form.value.streetAddress = user.value.address
  }
}

const fetchStripeKey = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/config/stripe-key`)
    if (res.ok) {
      const data = await res.json()
      stripePublishableKey.value = data.publishableKey
    }
  } catch (err) {
    console.error('Failed to load Stripe publishable key:', err)
  }
}

const validateForm = () => {
  const errs: Record<string, string> = {}
  if (!form.value.firstName.trim()) errs.firstName = 'First name is required'
  if (!form.value.lastName.trim()) errs.lastName = 'Last name is required'
  if (!form.value.streetAddress.trim()) errs.streetAddress = 'Street address is required'
  if (!form.value.city.trim()) errs.city = 'Town / City is required'
  if (!form.value.state.trim()) errs.state = 'State is required'
  if (!form.value.zipCode.trim()) errs.zipCode = 'ZIP Code is required'
  if (!form.value.phone.trim()) errs.phone = 'Phone number is required'
  
  if (!form.value.email.trim()) {
    errs.email = 'Email address is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errs.email = 'Please enter a valid email address'
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

const handlePlaceOrder = async (paymentMethod: string) => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  
  // Format shipping address nicely for database storage
  const formattedAddress = [
    `${form.value.firstName} ${form.value.lastName}`,
    form.value.companyName ? `Company: ${form.value.companyName}` : '',
    form.value.streetAddress,
    form.value.apartment ? `Apt/Suite: ${form.value.apartment}` : '',
    `${form.value.city}, ${form.value.state} ${form.value.zipCode}`,
    form.value.country,
    `Phone: ${form.value.phone}`,
    `Email: ${form.value.email}`
  ].filter(Boolean).join(', ')

  try {
    const addressWithNotes = orderNotes.value.trim() 
      ? `${formattedAddress} | Note: ${orderNotes.value.trim()}`
      : formattedAddress

    const result = await submitCheckout(addressWithNotes, paymentMethod)

    // If Stripe payment is requested, show Stripe Payment Element step
    if (paymentMethod === 'card' && result.clientSecret) {
      stripeClientSecret.value = result.clientSecret
      pendingOrder.value = result.order
      showStripePayment.value = true
    }
  } catch (err) {
    console.error('Order placement failed:', err)
  } finally {
    loading.value = false
  }
}

const handleStripeSuccess = () => {
  if (pendingOrder.value) {
    confirmStripeSuccess(pendingOrder.value)
    showStripePayment.value = false
  }
}
</script>

<template>
  <div class="leading-relaxed">
    <!-- Breadcrumb Section -->
    <section class="bg-gray-50 text-center py-16 mb-16 w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-medium tracking-wider mb-2 text-gray-900 uppercase">CHECKOUT</h1>
        <p class="text-gray-500 text-sm">
          <router-link to="/" class="hover:text-pink-500">Home</router-link> 
          &gt; 
          <router-link to="/shop" class="hover:text-pink-500">Shop</router-link>
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 mb-20">
      
      <!-- SUCCESS STATE -->
      <div v-if="checkoutSuccess && orderDetails" class="bg-white border border-emerald-100 p-10 text-center max-w-2xl mx-auto rounded-none mb-16">
        <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle class="w-10 h-10" />
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">Order Placed Successfully!</h2>
        <p class="text-gray-500 text-sm mb-6">Thank you for your purchase. Your order has been registered.</p>

        <!-- Order Info Summary -->
        <div class="bg-gray-50 p-6 text-left text-sm space-y-3 mb-8 border border-gray-100">
          <div>
            <span class="text-gray-400 uppercase font-semibold text-xs tracking-wider">Order ID:</span>
            <span class="text-gray-800 font-mono ml-2">{{ orderDetails._id }}</span>
          </div>
          <div>
            <span class="text-gray-400 uppercase font-semibold text-xs tracking-wider">Total Amount:</span>
            <span class="text-pink-500 font-bold ml-2">${{ orderDetails.totalAmount?.toFixed(2) }}</span>
          </div>
          <div>
            <span class="text-gray-400 uppercase font-semibold text-xs tracking-wider">Shipping Details:</span>
            <p class="text-gray-600 mt-1 pl-2 border-l-2 border-gray-200 leading-relaxed font-normal">{{ orderDetails.shippingAddress }}</p>
          </div>
        </div>

        <button 
          @click="router.push('/shop')" 
          class="bg-pink-500 hover:bg-pink-500/90 text-white font-semibold text-xs tracking-widest uppercase py-3 px-8 rounded-none transition-all cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>

      <!-- EMPTY CART STATE -->
      <div v-else-if="cartItems.length === 0" class="text-center py-20 bg-white border border-gray-100 max-w-2xl mx-auto rounded-none mb-16">
        <div class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag class="w-8 h-8" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">Your Cart is Empty</h2>
        <p class="text-gray-500 text-sm mb-8">Add some products to your cart before checking out.</p>
        <button 
          @click="router.push('/shop')" 
          class="bg-pink-500 hover:bg-pink-500/90 text-white font-semibold text-xs tracking-widest uppercase py-3 px-8 rounded-none transition-all cursor-pointer"
        >
          Go to Shop
        </button>
      </div>

      <!-- ACTIVE CHECKOUT STATE -->
      <div v-else>
        <!-- Stripe Payment Element step -->
        <div v-if="showStripePayment && stripeClientSecret && stripePublishableKey" class="max-w-2xl mx-auto mb-16">
          <StripePayment
            :publishable-key="stripePublishableKey"
            :client-secret="stripeClientSecret"
            :total="total"
            @success="handleStripeSuccess"
            @cancel="showStripePayment = false"
          />
        </div>

        <!-- Billing & Order Summary details step -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <!-- Left Column: Billing Details & Cart Totals -->
          <div class="space-y-16">
            <!-- Billing Details Form -->
            <CheckoutBillingForm v-model="form" :errors="errors" />

            <!-- Cart Totals & Payments -->
            <CheckoutOrderSummary 
              :subtotal="subtotal"
              :discount-amount="discountAmount"
              :total="total"
              :loading="loading"
              :error="checkoutError"
              @place-order="handlePlaceOrder"
            />
          </div>

          <!-- Right Column: Additional Information -->
          <div class="lg:sticky lg:top-8">
            <CheckoutAdditionalInfo v-model="orderNotes" />
          </div>

        </div>
      </div>

    </div>

    <!-- Extra sections below checkout card -->
    <!-- Customers Reviews -->
    <ReviewsSection />

    <!-- Latest Posts -->
    <LatestPostsSection />

    <!-- Brand Logos -->
    <BrandsSection />

    <!-- Instagram Section -->
    <InstagramSection />
  </div>
</template>
