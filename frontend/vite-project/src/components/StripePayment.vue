<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{
  publishableKey: string
  clientSecret: string
  total: number
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const stripeInstance = ref<Stripe | null>(null)
const elementsInstance = ref<StripeElements | null>(null)
const stripeError = ref('')
const loadingStripe = ref(true)
const paying = ref(false)

onMounted(async () => {
  try {
    if (!props.publishableKey) {
      throw new Error('Stripe Publishable Key is missing')
    }
    
    // Load stripe library
    const stripe = await loadStripe(props.publishableKey)
    if (!stripe) {
      throw new Error('Failed to load Stripe SDK')
    }
    stripeInstance.value = stripe

    // Create Stripe Elements container
    const elements = stripe.elements({
      clientSecret: props.clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#ff6543',
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '0px'
        }
      }
    })
    elementsInstance.value = elements

    // Create and mount the Payment Element
    const paymentElement = elements.create('payment')
    paymentElement.mount('#payment-element')

    loadingStripe.value = false
  } catch (err: any) {
    stripeError.value = err.message || 'Failed to initialize payment gateway'
    loadingStripe.value = false
  }
})

const handlePayment = async () => {
  if (!stripeInstance.value || !elementsInstance.value) return

  paying.value = true
  stripeError.value = ''

  try {
    // Confirm payment directly in client browser, avoiding page reload if possible
    const { error, paymentIntent } = await stripeInstance.value.confirmPayment({
      elements: elementsInstance.value,
      confirmParams: {
        return_url: window.location.origin + '/checkout?success=true'
      },
      redirect: 'if_required'
    })

    if (error) {
      // Show payment error
      stripeError.value = error.message || 'Payment failed'
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded!
      emit('success')
    } else {
      stripeError.value = 'Unexpected payment response'
    }
  } catch (err: any) {
    stripeError.value = err.message || 'An error occurred during payment'
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div class="text-left font-sans bg-white border border-gray-100 p-8 space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-gray-100">
      <h2 class="text-lg font-medium tracking-wider text-gray-900 uppercase">SECURE PAYMENT</h2>
      <span class="flex items-center gap-1 text-xs text-emerald-600 font-semibold uppercase tracking-wider">
        <ShieldCheck class="w-4 h-4" /> 256-bit SSL
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="loadingStripe" class="py-16 flex flex-col items-center justify-center text-gray-400 gap-3">
      <Loader2 class="w-8 h-8 animate-spin text-pink-500" />
      <span class="text-sm font-medium">Setting up secure checkout...</span>
    </div>

    <!-- Error State -->
    <div v-if="stripeError" class="bg-red-50 text-red-700 text-xs p-4 rounded border-l-4 border-red-500">
      {{ stripeError }}
    </div>

    <!-- Stripe Element container (hidden when loading) -->
    <div :class="{ 'hidden': loadingStripe }">
      <div id="payment-element" class="mb-6"></div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4">
        <button
          @click="emit('cancel')"
          :disabled="paying"
          class="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" /> Edit details
        </button>

        <button
          @click="handlePayment"
          :disabled="paying || loadingStripe"
          class="w-full sm:w-auto bg-pink-500 hover:bg-pink-500/90 text-white font-semibold text-xs tracking-widest uppercase py-4 px-8 rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="paying" class="w-4 h-4 animate-spin" />
          CONFIRM PAYMENT (${{ total.toFixed(2) }})
        </button>
      </div>
    </div>
  </div>
</template>
