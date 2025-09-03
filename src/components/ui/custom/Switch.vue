<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
    class="inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    :class="modelValue ? 'bg-primary' : 'bg-input'"
  >
    <span
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
    />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>