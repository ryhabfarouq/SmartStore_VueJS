<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  subtotal: number
  discountAmount: number
  total: number
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  (e: 'placeOrder', paymentMethod: string): void
}>()

// Map the radio selections to backend-friendly values ('cod' or 'card')
const selectedOption = ref('bank_transfer')

const paymentMethodMap: Record<string, string> = {
  bank_transfer: 'card',
  check: 'card',
  cod: 'cod',
  paypal: 'card'
}

const handlePlaceOrder = () => {
  const backendMethod = paymentMethodMap[selectedOption.value] || 'cod'
  emit('placeOrder', backendMethod)
}
</script>

<template>
  <div class="text-left font-sans">
    <h2 class="text-lg font-medium tracking-wider text-gray-900 mb-8 uppercase">CART TOTALS</h2>

    <div class="border border-gray-100 p-8 bg-white space-y-6">
      <!-- Subtotal -->
      <div class="flex justify-between items-center pb-4 border-b border-gray-100 text-sm">
        <span class="text-gray-500 font-medium">SUBTOTAL</span>
        <span class="text-pink-500 font-semibold">${{ subtotal.toFixed(2) }}</span>
      </div>

      <!-- Discount (If any) -->
      <div v-if="discountAmount > 0" class="flex justify-between items-center pb-4 border-b border-gray-100 text-sm">
        <span class="text-gray-500 font-medium">DISCOUNT</span>
        <span class="text-emerald-600 font-semibold">-${{ discountAmount.toFixed(2) }}</span>
      </div>

      <!-- Total -->
      <div class="flex justify-between items-center pb-6 border-b border-gray-100 text-sm">
        <span class="text-gray-900 font-bold">TOTAL</span>
        <span class="text-pink-500 font-bold text-lg">${{ total.toFixed(2) }}</span>
      </div>

      <!-- Payment Methods -->
      <div class="space-y-4 pt-2">
        <!-- Direct bank transfer -->
        <label class="flex items-start gap-3 cursor-pointer group text-sm text-gray-600 font-medium">
          <input
            type="radio"
            name="payment_method"
            value="bank_transfer"
            v-model="selectedOption"
            class="mt-1 accent-pink-500"
          />
          <span class="group-hover:text-gray-900 transition-colors">Direct bank transfer</span>
        </label>

        <!-- Check payments -->
        <label class="flex items-start gap-3 cursor-pointer group text-sm text-gray-600 font-medium">
          <input
            type="radio"
            name="payment_method"
            value="check"
            v-model="selectedOption"
            class="mt-1 accent-pink-500"
          />
          <span class="group-hover:text-gray-900 transition-colors">Check payments</span>
        </label>

        <!-- Cash on delivery -->
        <label class="flex items-start gap-3 cursor-pointer group text-sm text-gray-600 font-medium">
          <input
            type="radio"
            name="payment_method"
            value="cod"
            v-model="selectedOption"
            class="mt-1 accent-pink-500"
          />
          <span class="group-hover:text-gray-900 transition-colors">Cash on delivery</span>
        </label>

        <!-- PayPal -->
        <label class="flex items-start gap-3 cursor-pointer group text-sm text-gray-600 font-medium">
          <input
            type="radio"
            name="payment_method"
            value="paypal"
            v-model="selectedOption"
            class="mt-1 accent-pink-500"
          />
          <span class="group-hover:text-gray-900 transition-colors">PayPal</span>
        </label>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 text-red-700 text-xs p-4 rounded border-l-4 border-red-500">
        {{ error }}
      </div>

      <!-- Submit button -->
      <div class="pt-4">
        <button
          @click="handlePlaceOrder"
          :disabled="loading"
          class="w-full md:w-auto bg-pink-500 hover:bg-pink-500/90 text-white font-semibold text-xs tracking-widest uppercase py-4 px-8 rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          PLACE AN ORDER
        </button>
      </div>
    </div>
  </div>
</template>
