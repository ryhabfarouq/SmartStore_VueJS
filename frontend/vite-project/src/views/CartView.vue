<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { useAuth } from '../composables/useAuth'
import StripePayment from '../components/StripePayment.vue'
import { API_BASE_URL } from '../config'
import { 
  ShoppingBag, 
  Trash2, 
  Tag, 
  MapPin, 
  CreditCard, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Truck
} from 'lucide-vue-next'

const router = useRouter()
const { isAuthenticated, user } = useAuth()

const { 
  cartItems, 
  itemsCount, 
  subtotal, 
  discountAmount, 
  total, 
  activeCoupon, 
  applyCoupon, 
  removeCoupon, 
  removeFromCart, 
  updateQuantity,
  submitCheckout,
  checkoutSuccess,
  orderDetails,
  checkoutError,
  confirmStripeSuccess,
  resetCheckout
} = useCart()

// Stripe payment refs
const stripePublishableKey = ref('')
const stripeClientSecret = ref('')
const showStripePayment = ref(false)
const pendingOrder = ref<any>(null)

onMounted(() => {
  // Always reset checkout success state when loading the cart page
  resetCheckout()
  fetchStripeKey()
})

onUnmounted(() => {
  // Reset state when navigating away so that it doesn't stick
  resetCheckout()
})

const customerForm = reactive({
  name: '',
  email: '',
  phone: '',
  address: ''
})

// Prefill shipping details when user is authenticated
watch(user, () => {
  if (user.value) {
    if (!customerForm.name) customerForm.name = user.value.name || ''
    if (!customerForm.email) customerForm.email = user.value.email || ''
    if (!customerForm.phone) customerForm.phone = user.value.phone || ''
    if (!customerForm.address) customerForm.address = user.value.address || ''
  }
}, { immediate: true })

// Local states
const couponCode = ref('')
const couponLoading = ref(false)
const couponError = ref('')
const couponSuccessMsg = ref('')

const paymentMethod = ref('cod')
const checkoutLoading = ref(false)
const addressError = ref('')

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

const handleApplyCoupon = async () => {
  if (!couponCode.value) return
  couponLoading.value = true
  couponError.value = ''
  couponSuccessMsg.value = ''
  try {
    await applyCoupon(couponCode.value)
    couponSuccessMsg.value = `Coupon "${couponCode.value.toUpperCase()}" applied successfully!`
    couponCode.value = ''
  } catch (err: any) {
    couponError.value = err.message || 'Invalid or expired coupon'
  } finally {
    couponLoading.value = false
  }
}

const handleRemoveCoupon = () => {
  removeCoupon()
  couponSuccessMsg.value = ''
  couponError.value = ''
}

const handleQuantityChange = (productId: string, qty: number) => {
  try {
    updateQuantity(productId, qty)
  } catch (err: any) {
    alert(err.message || 'Failed to update quantity')
  }
}

const handleCheckout = async () => {
  if (!isAuthenticated.value) {
    if (confirm('Please log in or register to place your order.')) {
      router.push({ path: '/login', query: { redirect: '/cart' } })
    }
    return
  }

  addressError.value = ''

  if (!customerForm.name.trim() || !customerForm.email.trim() || !customerForm.phone.trim() || !customerForm.address.trim()) {
    addressError.value = 'Name, email, phone, and address are required'
    return
  }

  // Format shipping address nicely for database storage
  const formattedAddress = [
    customerForm.name.trim(),
    customerForm.address.trim(),
    `Phone: ${customerForm.phone.trim()}`,
    `Email: ${customerForm.email.trim()}`
  ].filter(Boolean).join(', ')

  checkoutLoading.value = true
  try {
    const result = await submitCheckout(formattedAddress, paymentMethod.value)

    // If Stripe payment is requested, show Stripe Payment Element step
    if (paymentMethod.value === 'card' && result.clientSecret) {
      stripeClientSecret.value = result.clientSecret
      pendingOrder.value = result.order
      showStripePayment.value = true
    }
  } catch (err: any) {
    // Error is set globally in composable
  } finally {
    checkoutLoading.value = false
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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-left">
    
    <!-- Breadcrumb -->
    <div class="flex items-center text-xs text-gray-500 gap-1.5 uppercase font-medium tracking-wide mb-8">
      <router-link to="/" class="hover:text-pink-500 transition-colors">Home</router-link>
      <span>/</span>
      <router-link to="/shop" class="hover:text-pink-500 transition-colors">Shop</router-link>
      <span>/</span>
      <span class="text-gray-900 font-semibold">Shopping Cart</span>
    </div>

    <h1 class="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Shopping Cart</h1>

    <!-- ORDER PLACED SUCCESS STATE -->
    <div v-if="checkoutSuccess && orderDetails" class="bg-white border border-emerald-100 rounded-lg p-10 text-center max-w-2xl mx-auto shadow-sm">
      <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle class="w-10 h-10" />
      </div>
      
      <h2 class="text-2xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h2>
      <p class="text-gray-500 text-sm mb-6 leading-relaxed">
        Thank you for your purchase! Your order has been registered and is now processing.
      </p>

      <div class="bg-gray-50 rounded-lg p-6 mb-8 text-left border border-gray-100">
        <div class="flex justify-between items-center pb-3 border-b border-gray-200/50 mb-3 text-sm">
          <span class="text-gray-400 font-medium">Order ID</span>
          <span class="font-mono font-bold text-gray-800">{{ orderDetails._id }}</span>
        </div>
        <div class="flex justify-between items-center pb-3 border-b border-gray-200/50 mb-3 text-sm">
          <span class="text-gray-400 font-medium">Total Amount</span>
          <span class="font-bold text-pink-500 text-base">${{ orderDetails.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center pb-3 border-b border-gray-200/50 mb-3 text-sm">
          <span class="text-gray-400 font-medium">Payment Method</span>
          <span class="font-semibold text-gray-700 uppercase">{{ orderDetails.paymentMethod }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-400 font-medium block mb-1">Shipping Address</span>
          <span class="text-gray-700 font-semibold">{{ orderDetails.shippingAddress }}</span>
        </div>
      </div>

      <router-link 
        to="/shop" 
        @click="resetCheckout"
        class="bg-pink-500 text-white font-bold text-sm tracking-wide py-3.5 px-8 rounded shadow hover:opacity-95 active:scale-95 transition-all inline-block uppercase cursor-pointer"
      >
        Continue Shopping
      </router-link>
    </div>

    <!-- EMPTY CART STATE -->
    <div v-else-if="cartItems.length === 0" class="bg-white border border-gray-100 rounded-lg p-16 text-center max-w-xl mx-auto shadow-sm">
      <div class="w-20 h-20 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <ShoppingBag class="w-10 h-10" />
      </div>
      
      <h2 class="text-xl font-bold text-gray-900 mb-2">
        Your Shopping Cart is Empty
      </h2>
      
      <p class="text-gray-500 text-sm mb-8 leading-relaxed max-w-md mx-auto">
        It looks like you haven't added any products to your shopping cart yet. Visit our shop catalog to explore our electronics, cosmetics, and more.
      </p>

      <router-link 
        to="/shop" 
        class="bg-pink-500 text-white font-bold text-sm tracking-wide py-3 px-8 rounded shadow hover:opacity-95 active:scale-95 transition-all inline-block uppercase"
      >
        Go Shopping
      </router-link>
    </div>

    <!-- MAIN CART CONTENT -->
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

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Items List -->
      <div class="lg:col-span-8 space-y-4">
        <div class="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-100 hidden sm:grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div class="col-span-6">Product</div>
            <div class="col-span-2 text-center">Price</div>
            <div class="col-span-2 text-center">Quantity</div>
            <div class="col-span-2 text-right">Subtotal</div>
          </div>

          <div class="divide-y divide-gray-100">
            <div 
              v-for="item in cartItems" 
              :key="item.product._id"
              class="p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
            >
              <!-- Info -->
              <div class="col-span-1 sm:col-span-6 flex gap-4 items-center">
                <div class="w-16 h-16 bg-gray-50 border border-gray-100 rounded p-1 flex items-center justify-center shrink-0">
                  <img :src="item.product.thumbnail" :alt="item.product.title" class="max-w-full max-h-full object-contain mix-blend-multiply" />
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-bold text-gray-800 truncate hover:text-pink-500">
                    <router-link :to="`/products/${item.product._id}`">{{ item.product.title }}</router-link>
                  </h3>
                  <p v-if="item.product.brand" class="text-xs text-gray-400 mt-0.5">{{ item.product.brand }}</p>
                  <button 
                    @click="removeFromCart(item.product._id)"
                    class="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 mt-2 transition-colors cursor-pointer"
                  >
                    <Trash2 class="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>

              <!-- Price -->
              <div class="col-span-1 sm:col-span-2 text-left sm:text-center">
                <span class="sm:hidden text-xs font-bold text-gray-400 uppercase mr-1">Price:</span>
                <span class="text-sm font-semibold text-gray-800">${{ item.product.price.toFixed(2) }}</span>
              </div>

              <!-- Qty selection -->
              <div class="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                <div class="flex items-center border border-gray-200 rounded">
                  <button 
                    @click="handleQuantityChange(item.product._id, item.quantity - 1)"
                    class="px-2.5 py-1 text-gray-500 hover:text-pink-500 font-bold text-xs"
                  >-</button>
                  <span class="px-2.5 text-xs font-semibold text-gray-850">{{ item.quantity }}</span>
                  <button 
                    @click="handleQuantityChange(item.product._id, item.quantity + 1)"
                    class="px-2.5 py-1 text-gray-500 hover:text-pink-500 font-bold text-xs"
                  >+</button>
                </div>
              </div>

              <!-- Subtotal -->
              <div class="col-span-1 sm:col-span-2 text-left sm:text-right">
                <span class="sm:hidden text-xs font-bold text-gray-400 uppercase mr-1">Total:</span>
                <span class="text-sm font-extrabold text-pink-500">${{ (item.product.price * item.quantity).toFixed(2) }}</span>
              </div>

            </div>
          </div>
        </div>

        <!-- Coupon code section -->
        <div class="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Tag class="w-4 h-4 text-gray-400" /> Have a Coupon?
          </h3>

          <!-- Form inputs -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 relative">
              <input 
                v-model="couponCode"
                type="text"
                placeholder="ENTER COUPON CODE"
                class="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 transition-all uppercase font-mono font-bold"
                :disabled="!!activeCoupon"
              />
            </div>
            <button 
              v-if="!activeCoupon"
              @click="handleApplyCoupon"
              :disabled="couponLoading || !couponCode"
              class="bg-gray-800 text-white font-bold text-xs py-2 px-6 rounded uppercase hover:bg-gray-900 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Loader2 v-if="couponLoading" class="w-3.5 h-3.5 animate-spin" />
              Apply
            </button>
            <button 
              v-else
              @click="handleRemoveCoupon"
              class="bg-red-500 text-white font-bold text-xs py-2 px-6 rounded uppercase hover:bg-red-650 transition-all cursor-pointer flex items-center justify-center"
            >
              Remove Coupon
            </button>
          </div>

          <p v-if="couponError" class="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
            <AlertCircle class="w-3.5 h-3.5" /> {{ couponError }}
          </p>
          <p v-if="couponSuccessMsg" class="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle class="w-3.5 h-3.5" /> {{ couponSuccessMsg }}
          </p>

          <!-- Current active coupon badge -->
          <div v-if="activeCoupon" class="mt-3 flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md p-2 text-xs">
            <span class="font-mono font-bold tracking-wider bg-emerald-150 py-0.5 px-1.5 rounded">{{ activeCoupon.code }}</span>
            <span>
              discount: {{ activeCoupon.discountType === 'percentage' ? activeCoupon.discountValue + '%' : '$' + activeCoupon.discountValue }}
            </span>
          </div>
        </div>
      </div>

      <!-- Checkout / Order summary Column -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- Summary details -->
        <div class="bg-white border border-gray-100 rounded-lg p-6 shadow-sm text-left">
          <h2 class="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Order Summary</h2>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-500 font-medium">
              <span>Items Total ({{ itemsCount }} items)</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            
            <div v-if="activeCoupon" class="flex justify-between text-emerald-600 font-medium">
              <span>Discount ({{ activeCoupon.code }})</span>
              <span>-${{ discountAmount.toFixed(2) }}</span>
            </div>

            <div class="flex justify-between text-gray-500 font-medium">
              <span>Shipping Fee</span>
              <span class="text-emerald-600">FREE</span>
            </div>

            <div class="border-t border-gray-100 pt-4 mt-2 flex justify-between items-baseline">
              <span class="text-base font-extrabold text-gray-900">Total Amount</span>
              <span class="text-xl font-black text-pink-500">${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Checkout Form details -->
        <div class="bg-white border border-gray-100 rounded-lg p-6 shadow-sm text-left">
          <h2 class="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Shipping & Payment</h2>
          
          <div class="space-y-4">
            
            <!-- Customer and address fields -->
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
                <input
                  v-model="customerForm.name"
                  type="text"
                  placeholder="Enter your name"
                  class="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  :class="addressError && !customerForm.name.trim() ? 'border-red-300' : ''"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  v-model="customerForm.email"
                  type="email"
                  placeholder="Enter your email"
                  class="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  :class="addressError && !customerForm.email.trim() ? 'border-red-300' : ''"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  v-model="customerForm.phone"
                  type="tel"
                  placeholder="Enter your phone"
                  class="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  :class="addressError && !customerForm.phone.trim() ? 'border-red-300' : ''"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5 text-gray-400" /> Address
                </label>
                <textarea
                  v-model="customerForm.address"
                  rows="3"
                  placeholder="Enter full delivery address"
                  class="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                  :class="addressError && !customerForm.address.trim() ? 'border-red-300' : ''"
                ></textarea>
              </div>
            </div>

            <p v-if="addressError" class="text-xs text-red-600 mt-1 flex items-center gap-1 font-semibold">
              <AlertCircle class="w-3.5 h-3.5" /> {{ addressError }}
            </p>

            <!-- Payment selection -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CreditCard class="w-3.5 h-3.5 text-gray-400" /> Payment Method
              </label>
              
              <div class="space-y-2">
                <label class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-3 text-xs font-semibold text-gray-700 select-none cursor-pointer">
                  <input 
                    type="radio" 
                    value="cod" 
                    v-model="paymentMethod" 
                    class="accent-pink-500 rounded-full cursor-pointer" 
                  />
                  <span>Cash on Delivery</span>
                </label>
                
                <label class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-3 text-xs font-semibold text-gray-700 select-none cursor-pointer">
                  <input 
                    type="radio" 
                    value="card" 
                    v-model="paymentMethod" 
                    class="accent-pink-500 rounded-full cursor-pointer" 
                  />
                  <span>Stripe (Credit / Debit Card)</span>
                </label>
              </div>
            </div>

            <!-- Checkout error alert -->
            <div v-if="checkoutError" class="bg-red-50 border-l-4 border-red-500 p-4 rounded text-xs text-red-700 font-medium flex gap-2">
              <AlertCircle class="w-4 h-4 text-red-500 shrink-0" />
              <span>{{ checkoutError }}</span>
            </div>

            <!-- Action submit -->
            <button 
              @click="handleCheckout"
              :disabled="checkoutLoading"
              class="w-full bg-pink-500 text-white font-bold text-sm tracking-widest py-4 px-6 rounded shadow hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 uppercase cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="checkoutLoading" class="w-4 h-4 animate-spin" />
              <ShoppingBag class="w-4 h-4" /> Place Order
            </button>
            
            <div class="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center mt-2">
              <Truck class="w-3.5 h-3.5" /> 2-3 business days delivery
            </div>

          </div>
        </div>

      </div>

      </div>
    </div>
  </div>
</template>
