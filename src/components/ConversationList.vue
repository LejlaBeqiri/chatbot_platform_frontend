<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Icon } from "@iconify/vue";
import type { Conversation } from '@/stores/types/chat.types';
import { useConversationStore } from '@/stores/conversation.store';

// Define props
const props = defineProps<{ agentId: number | null }>();

const emit = defineEmits<{
  (e: 'conversation-selected', conversation: Conversation): void;
}>();

const selectedConversationId = ref<number | null>(null);
const loading = ref(false);
const conversationStore = useConversationStore();

const conversations = computed(() => conversationStore.conversations);

const fetchConversations = async () => {
  if (props.agentId === null) {
    console.warn("Agent ID is null, cannot fetch conversations.");
    conversationStore.conversations = [];
    return;
  }
  loading.value = true;
  try {
    await conversationStore.fetchConversations(props.agentId);

  } catch (error) {
    console.error('Error fetching conversations:', error);
  } finally {
    loading.value = false;
  }
};


watch(() => props.agentId, (newAgentId) => {
  if (newAgentId !== null) {
    fetchConversations();
  } else {
    conversationStore.conversations = [];
    selectedConversationId.value = null;
    conversationStore.currentConversation = null;
  }
}, { immediate: true });

const selectConversation = async (conversation: Conversation) => {
  selectedConversationId.value = conversation.id;
  conversationStore.setCurrentConversation(conversation);
  if (props.agentId !== null) {
    await conversationStore.fetchConversationMessages(conversation.id);
  }
  emit('conversation-selected', conversation);
};
</script>

<template>
  <div class="chat-list">
    <div v-if="loading" class="p-4">
      <p class="text-gray-500">Loading conversations...</p>
    </div>
    <div v-else-if="conversations.length === 0" class="p-4">
      <p class="text-gray-500">No conversations found</p>
    </div>
    <div v-else v-for="conversation in conversations" :key="conversation.id" @click="selectConversation(conversation)"
      class="chat-item" :class="{ 'active': selectedConversationId === conversation.id }">
      <p class="text-sm text-gray-700 font-medium">{{ `Conversation ${conversation.id}` }}</p>
      <div class="flex justify-between items-center mt-2">
        <div class="channel-badge">
          <Icon icon="lucide:bot" width="20" height="20" />
        </div>
        <span class="text-xs text-gray-500">{{ new Date(conversation.updated_at).toLocaleDateString() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list {
  width: 350px;
  border-right: 1px solid #e5e7eb;
  height: 100%;
  overflow-y: auto;
}

.chat-item {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #f9fafb;
}

.chat-item.active {
  background-color: #f3f4f6;
  border-left: 3px solid gray;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

.channel-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  color: black;
}
</style>