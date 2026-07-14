<script setup lang="ts">

export interface BillingFormState {
  firstName: string
  lastName: string
  companyName: string
  country: string
  streetAddress: string
  apartment: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
}

const props = defineProps<{
  modelValue: BillingFormState
  errors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: BillingFormState): void
}>()

const updateField = (key: keyof BillingFormState, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <div class="text-left font-sans">
    <h2 class="text-lg font-medium tracking-wider text-gray-900 mb-8 uppercase">BILLING DETAILS</h2>

    <div class="space-y-6">
      <!-- First Name & Last Name -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">First name *</label>
          <input
            type="text"
            :value="modelValue.firstName"
            @input="updateField('firstName', ($event.target as HTMLInputElement).value)"
            class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.firstName }"
          />
          <p v-if="errors.firstName" class="text-xs text-red-500 mt-1">{{ errors.firstName }}</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last name *</label>
          <input
            type="text"
            :value="modelValue.lastName"
            @input="updateField('lastName', ($event.target as HTMLInputElement).value)"
            class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.lastName }"
          />
          <p v-if="errors.lastName" class="text-xs text-red-500 mt-1">{{ errors.lastName }}</p>
        </div>
      </div>

      <!-- Company Name -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Company name (optional)</label>
        <input
          type="text"
          :value="modelValue.companyName"
          @input="updateField('companyName', ($event.target as HTMLInputElement).value)"
          class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
        />
      </div>

      <!-- Country / Region -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Country / Region *</label>
        <select
          :value="modelValue.country"
          @change="updateField('country', ($event.target as HTMLSelectElement).value)"
          class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
        >
          <option value="United States (US)">United States (US)</option>
          <option value="United Kingdom (UK)">United Kingdom (UK)</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Egypt">Egypt</option>
        </select>
      </div>

      <!-- Street Address -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Street address *</label>
        <div class="space-y-3">
          <input
            type="text"
            placeholder="House number and street name"
            :value="modelValue.streetAddress"
            @input="updateField('streetAddress', ($event.target as HTMLInputElement).value)"
            class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.streetAddress }"
          />
          <input
            type="text"
            placeholder="Apartments, suite, etc. (optional)"
            :value="modelValue.apartment"
            @input="updateField('apartment', ($event.target as HTMLInputElement).value)"
            class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
          />
        </div>
        <p v-if="errors.streetAddress" class="text-xs text-red-500 mt-1">{{ errors.streetAddress }}</p>
      </div>

      <!-- Town / City -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Town / City *</label>
        <input
          type="text"
          :value="modelValue.city"
          @input="updateField('city', ($event.target as HTMLInputElement).value)"
          class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.city }"
        />
        <p v-if="errors.city" class="text-xs text-red-500 mt-1">{{ errors.city }}</p>
      </div>

      <!-- State -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">State *</label>
        <input
          type="text"
          placeholder="Florida"
          :value="modelValue.state"
          @input="updateField('state', ($event.target as HTMLInputElement).value)"
          class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.state }"
        />
        <p v-if="errors.state" class="text-xs text-red-500 mt-1">{{ errors.state }}</p>
      </div>

      <!-- ZIP Code -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ZIP Code *</label>
        <input
          type="text"
          :value="modelValue.zipCode"
          @input="updateField('zipCode', ($event.target as HTMLInputElement).value)"
          class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.zipCode }"
        />
        <p v-if="errors.zipCode" class="text-xs text-red-500 mt-1">{{ errors.zipCode }}</p>
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone *</label>
        <input
          type="text"
          :value="modelValue.phone"
          @input="updateField('phone', ($event.target as HTMLInputElement).value)"
          class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.phone }"
        />
        <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
      </div>

      <!-- Email Address -->
      <div>
        <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email address *</label>
        <input
          type="email"
          :value="modelValue.email"
          @input="updateField('email', ($event.target as HTMLInputElement).value)"
          class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.email }"
        />
        <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
      </div>
    </div>
  </div>
</template>
