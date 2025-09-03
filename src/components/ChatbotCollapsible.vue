<template>
  <div class="chatbot-collapsible">
    <div
      role="button"
      :aria-expanded="modelValue"
      :aria-controls="'content-' + uid"
      @click="toggle"
      class="collapsible-trigger"
    >
      <slot name="trigger" />
    </div>

    <Transition
      name="slide"
      @enter="startTransition"
      @after-enter="endTransition"
      @before-leave="startTransition"
      @after-leave="endTransition"
    >
      <div
        v-show="modelValue"
        :id="'content-' + uid"
        class="collapsible-content"
      >
        <slot name="content" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { v4 as uuidv4 } from "uuid";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const uid = uuidv4()
const isTransitioning = ref(false)

const toggle = () => {
  if (!isTransitioning.value) {
    emit('update:modelValue', !props.modelValue)
  }
}

const startTransition = () => {
  isTransitioning.value = true
}

const endTransition = () => {
  isTransitioning.value = false
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.collapsible-trigger {
  cursor: pointer;
  user-select: none;
}

.collapsible-content {
  padding-left: 1.5rem;
}
</style>