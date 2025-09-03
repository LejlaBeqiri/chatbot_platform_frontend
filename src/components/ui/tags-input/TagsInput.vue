<template>
  <div class="flex flex-col space-y-2">
    <div class="flex flex-wrap gap-2">
      <div
        v-for="tag in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
      >
        <span>{{ tag }}</span>
        <button
          type="button"
          @click="removeTag(tag)"
          class="text-secondary-foreground/50 hover:text-secondary-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="relative">
      <Input
        v-model="inputValue"
        :placeholder="placeholder"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleBackspace"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';

const props = defineProps<{
  modelValue: string[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const inputValue = ref('');

const addTag = () => {
  const value = inputValue.value.trim();
  if (value && !props.modelValue.includes(value)) {
    emit('update:modelValue', [...props.modelValue, value]);
    inputValue.value = '';
  }
};

const removeTag = (tagToRemove: string) => {
  emit('update:modelValue', props.modelValue.filter(tag => tag !== tagToRemove));
};

const handleBackspace = (event: KeyboardEvent) => {
  if (inputValue.value === '' && props.modelValue.length > 0) {
    event.preventDefault();
    emit('update:modelValue', props.modelValue.slice(0, -1));
  }
};
</script>