<script setup lang="ts">
import chatbotToast from "@/components/chatbot-toast.vue"
import { ToastProvider } from "@/components/ui/toast"
import { RouterView } from 'vue-router'
</script>

<template>
    <ToastProvider>
        <RouterView />
        <chatbotToast />
    </ToastProvider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
