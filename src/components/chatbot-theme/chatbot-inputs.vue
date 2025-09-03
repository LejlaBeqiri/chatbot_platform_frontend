<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- Name input -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium">Name your agent</label>
      <input 
        v-model="agentName" 
        type="text"
        class="w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder="Enter agent name"
      />
    </div>

    <!-- Welcome message input -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium">Welcome message (optional)</label>
      <textarea 
        v-model="welcomeMessage"
        rows="3"
        class="w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        placeholder="Enter a welcome message for your users"
      ></textarea>
    </div>

    <!-- Theme selector -->
    <div class="flex flex-col gap-4">
      <label class="text-sm font-medium">Choose chat theme</label>
      <div class="flex gap-6 flex-wrap">
        <div 
          v-for="theme in themeColors" 
          :key="theme.id" 
          class="color-option cursor-pointer"
          :class="{ 'selected': selectedTheme === theme.id }"
          @click="selectedTheme = theme.id"
        >
          <div 
            class="w-12 h-12 rounded-full transition-all duration-200"
            :style="{ 
              backgroundColor: theme.color,
              border: selectedTheme === theme.id ? `1px solid #000`: 'none'
            }"
          ></div>
          <span class="text-sm mt-2 text-center block" :class="{ 'font-bold': selectedTheme === theme.id }">
            {{ theme.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { themeColors } from './theme'

const agentName = ref('')
const welcomeMessage = ref('')
const selectedTheme = ref('light')

const emit = defineEmits(['update:formData'])

watch([agentName, welcomeMessage, selectedTheme], () => {
  emit('update:formData', {
    name: agentName.value,
    welcomeMessage: welcomeMessage.value,
    theme: selectedTheme.value
  })
}, { immediate: true })
</script>

<style scoped>


input, textarea, select {
  transition: all 0.2s ease;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  position: relative;
}

.color-option div {
  box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.13), 0 1px 1px 0px rgba(0, 0, 0, 0.15);
  /* transition: all 0.2s ease-out; */
  border: 1px solid #fff;
}

.color-option:hover:not(.selected) div {
  border: 1px solid black;
  box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.8), 0 2px 4px 0px rgba(0, 0, 0, 0.1);
}

.color-option.selected div {
  border: 2px solid #000;
  box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.13), 0 1px 1px 0px rgba(0, 0, 0, 0.15);
}

.color-option span {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  font-weight: 400;
}

.color-option:hover span,
.color-option.selected span {
  opacity: 1;
}
</style>