<template>
  <div class="chat-interface">
    <div class="chat-content">
      <div class="chat-body">
        <div class="flex justify-between items-center px-4 py-2 border-b">
          <div class="flex items-center gap-2">
            <Icon icon="lucide:message-square" width="20" height="20" />
            <span class="text-sm font-medium">Chat History</span>
          </div>
          <button 
            v-if="conversation?.id && !isAdmin" 
            @click="clearChat" 
            class="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            :disabled="isClearing"
          >
            <Icon icon="lucide:trash-2" width="16" height="16" />
            <span>{{ isClearing ? 'Clearing...' : 'Clear Chat' }}</span>
          </button>
        </div>
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="isLoadingHistory" class="flex justify-center items-center py-4">
            <Icon icon="lucide:loader-2" class="animate-spin" width="24" height="24" />
            <span>Loading history...</span>
          </div>

          <template v-else>
            <template v-for="message in allMessages" :key="message.id">
              <div v-if="message.user_message" class="message-bubble outgoing">
                <div class="message-content">
                  <div class="message-details">
                    <div class="message-sender">You</div>
                    <p>{{ message.user_message }}</p>
                  </div>
                </div>
                <div class="message-time">{{ formatDate(message.created_at) }}</div>
              </div>

              <div v-if="message.bot_response !== undefined" class="message-bubble incoming">
                <div class="message-content">
                  <div class="message-icon">
                    <Icon icon="lucide:bot" width="20" height="20" />
                  </div>
                  <div class="message-details">
                    <div class="message-sender">AI Assistant</div>
                    <div class="markdown-content" v-html="parseMarkdown(message.bot_response)"></div>
                    <div v-if="isStreaming && isLastMessage(message.id)" class="text-xs text-gray-400 italic mt-1">
                      generating...
                    </div>
                  </div>
                </div>
                <div class="message-time">{{ formatDate(message.created_at) }}</div>
              </div>
            </template>

            <div v-if="isStreaming && messages.length > 0 && !messages[messages.length - 1]?.bot_response"
              class="message-bubble incoming typing-indicator-bubble">
              <div class="message-content">
                <div class="message-icon">
                  <Icon icon="lucide:bot" width="20" height="20" />
                </div>
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-if="showInputBox && !isAdmin " class="message-input-container">
          <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="Type a message..."
            class="message-input" :disabled="isStreaming" /> <button @click="sendMessage" class="send-button"
            :disabled="isStreaming || !newMessage.trim()">
            <Icon icon="lucide:send" width="20" height="20" />
          </button>
          <div v-if="storeError"
            class="text-red-500 text-xs mt-1 px-3 text-center absolute bottom-full w-full left-0 mb-1">
            {{ storeError }}
          </div>
        </div>      </div>
    </div>
  </div>

  <chatbot-confirm-dialog 
    ref="confirmDialog" 
    title="Please Confirm"
    description="Are you sure you want to clear this chat history? This action cannot be undone."
    confirm-text="Clear"
    @confirm="handleClearConfirm" 
  />
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { Icon } from "@iconify/vue";
import { useConversationStore } from '@/stores/conversation.store';
import type { Conversation } from '@/stores/types/chat.types';
import { marked } from 'marked';
import { formatDate } from '@/utils/globals';
import { useAuthStore } from '@/stores/auth.store';
import chatbotConfirmDialog from '@/components/chatbot-confirm-dialog.vue';

const authStore = useAuthStore();
const confirmDialog = ref();
const isAdmin = computed(() => authStore.user?.role === 'admin');

interface Message {
  id: number | string;
  user_message?: string;
  bot_response?: string;
  created_at: string;
  updated_at: string;
}

const newMessage = ref('');
const conversationStore = useConversationStore();
const isLoadingHistory = computed(() => conversationStore.loading);
const messagesContainer = ref<HTMLElement | null>(null);

const props = defineProps<{
  conversation: Conversation | null;
  showInputBox: boolean;
}>();


const messages = computed(() => conversationStore.getConversationMessages);
const isStreaming = computed(() => conversationStore.isStreamingMessage);
const storeError = computed(() => conversationStore.error);

const allMessages = computed<Message[]>(() => {
  return messages.value.filter((m): m is Message => !!m);
});

const loadChatHistory = async (chatId: number) => {
  conversationStore.error = null;
  try {
    await conversationStore.fetchConversationMessages(chatId);
    await nextTick();
    scrollToBottom(true);
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
};

watch(() => props.conversation?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    if (props.conversation) {
      conversationStore.setCurrentConversation(props.conversation);
      loadChatHistory(newId);
    }
  } else if (!newId) {
    conversationStore.setCurrentConversation(null);
    conversationStore.messages = [];
  }
}, { immediate: true });

const sendMessage = async () => {
  if (!newMessage.value.trim()  || isStreaming.value) return;

  const messageContent = newMessage.value;
  newMessage.value = '';

  conversationStore.error = null;

  await conversationStore.sendMessage(messageContent);
};

const isLastMessage = (messageId: string | number): boolean => {
  const msgs = messages.value;
  scrollToBottom(true);

  return msgs.length > 0 && msgs[msgs.length - 1].id === messageId;
};

const scrollToBottom = (force: boolean = false) => {
  nextTick(() => {
    if (messagesContainer.value) {
      const el = messagesContainer.value;
      const isScrolledToBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 100;
      if (force || isScrolledToBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
  });
};

watch(messages, () => {
  scrollToBottom();
}, { deep: true });

const parseMarkdown = (text?: string): string => {
  if (!text) return '';
  const rawHtml = marked(text) as string;
  return rawHtml;
};

watch(newMessage, (newValue) => {
  if (newValue && storeError.value) {
    conversationStore.error = null;
  }
});

const clearChat = () => {
  confirmDialog.value?.showDialog();
};

const handleClearConfirm = async () => {
  if (isClearing.value) return;
  isClearing.value = true;
  try {
    await conversationStore.clearConversation();
    // Clear local messages
    conversationStore.messages = [];
    // Reload conversation messages
    if (props.conversation?.id) {
      await loadChatHistory(props.conversation.id);
    }
  } catch (error) {
    console.error('Failed to clear chat:', error);
  } finally {
    isClearing.value = false;
  }
};

const isClearing = ref(false);

</script>

<style scoped>
.chat-interface {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background-color: #f9fafb;
}

.chat-content {
  margin: 0 auto;
  background-color: white;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.chat-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.chat-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  max-height: 500px;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scroll-behavior: smooth;
}


.message-bubble {
  max-width: 65%;
  display: flex;
  flex-direction: column;
  padding: 0.3rem;
}

.message-content {
  padding: 0.75rem;
  border-radius: 0.85rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.message-icon img {
  width: 16px;
  height: 16px;
}

.message-time {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 0.25rem;
  align-self: flex-end;
}

.incoming {
  align-self: flex-start;
}

.incoming .message-content {
  background-color: #f3f4f6;
  border-bottom-left-radius: 0.25rem;
}

.outgoing {
  align-self: flex-end;
}

.outgoing .message-content {
  background-color: #dbeafe;
  color: #1e3a8a;
  border-bottom-right-radius: 0.25rem;
  flex-direction: row-reverse;
}

.channel-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  color: black;
}

.message-input-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
  position: relative;
  display: flex;
  gap: 0.5rem;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  outline: none;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.message-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.send-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.message-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-sender {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.typing-indicator {
  padding: 0.5rem 1rem;
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.typing-indicator span {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>