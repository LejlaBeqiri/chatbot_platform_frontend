<template>
  <div class="chatbot-container" :style="{ background: themeColor }">
    <div class="chatbot-header">
      <div class="chatbot-logo">
        {{ formData?.name }}
        <!-- <img src="/path/to/logo.png" alt="Logo" /> -->
      </div>
      <button class="chatbot-close" @click="closeChatbot">&times;</button>
    </div>
    <div class="chatbot-messages">
      <div class="message user-message" :style="{ background: themeColor }">
        <p>{{ userPlaceholderMessage }}</p>
      </div>
      <div class="message agent-message" :style="{ background: themeColor }">
        <p>{{ formData?.name }}</p>
        <p>{{ agentPlaceholderMessage }}</p>
      </div>
    </div>
    <div class="chatbot-input">
      <input type="text" placeholder="Send a message..." v-model="userMessage" @keyup.enter="sendMessage" />
      <button @click="sendMessage">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-send">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
    <div class="chatbot-footer">
      <p>Powered by <a href="https://55.studio" target="_blank">55 Studio</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { themeColors } from './theme'

const props = defineProps<{
  formData?: {
    name: string;
    welcomeMessage: string;
    theme: string;
  }
}>()

const userMessage = ref('')
const userPlaceholderMessage = ref('This is a placeholder message from the user. Showcasing how a user would interact with the agent in a typical conversation.')
const agentPlaceholderMessage = ref('This is a placeholder message from the agent. Showcasing what the agent provides in response to a user\'s input.')
const themeColor = ref(themeColors[0].color)

const closeChatbot = () => {
}

const sendMessage = () => {
  if (userMessage.value.trim() !== '') {
    userMessage.value = ''
  }
}

watch(() => props.formData?.theme, (newTheme) => {
  const theme = themeColors.find(t => t.id === newTheme)
  if (theme) {
    themeColor.value = theme.color
  }
}, { immediate: true })
</script>

<style scoped>
.chatbot-container {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: v-bind('themeColor');
}

.chatbot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.chatbot-logo img {
  width: 24px;
  height: 24px;
}

chatbot-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.chatbot-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.message {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
}

.user-message {
  align-self: flex-start;
}

.agent-message {
  align-self: flex-end;
}

.chatbot-input {
  display: flex;
  padding: 16px;
  background: v-bind('themeColor');
}

.chatbot-input input {
  flex: 1;
  padding: 13px 12px;
  border-radius: 12px;
  outline: none;
}

chatbot-input button {
  background: none;
  border: none;
  margin-left: 8px;
  cursor: pointer;
}

.chatbot-footer {
  padding: 8px;
  text-align: center;
}

.chatbot-footer a {
  color: #007bff;
  text-decoration: none;
}
</style>