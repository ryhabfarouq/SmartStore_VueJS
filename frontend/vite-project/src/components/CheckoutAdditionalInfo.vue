<script setup lang="ts">

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="text-left font-sans">
    <h2 class="text-lg font-medium tracking-wider text-gray-900 mb-8 uppercase">ADDITIONAL INFORMATION</h2>

    <div>
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order notes (optional)</label>
      <textarea
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Notes about your order, like special notes for delivery."
        class="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white rounded-none transition-colors h-40 resize-none"
      ></textarea>
    </div>
  </div>
</template>
