<script setup lang="ts">
import ConversationList from '@/components/ConversationList.vue';
import ChatInterface from '@/components/ChatInterface.vue';
import type { Conversation } from '@/stores/types/chat.types';
import { ref, computed } from 'vue';
import { useConversationStore } from '@/stores/conversation.store';
import { useAgentStore } from '@/stores/agent.store';

const selectedConversation = ref<Conversation | null>(null);
const conversationStore = useConversationStore();
const agentStore = useAgentStore();

const currentAgentId = computed(() => agentStore.currentAgent?.id ?? null);

const handleConversationSelect = (conversation: Conversation) => {
  selectedConversation.value = conversation;
  conversationStore.currentConversation = conversation;
};

</script>

<template>
  <div class="chats-container">
    <div class="chats-header">
      <h1 class="text-2xl font-bold">Chats</h1>
    </div>
    <div class="chats-page">
      <ConversationList :agent-id="currentAgentId" @conversation-selected="handleConversationSelect" />
      <ChatInterface v-if="selectedConversation" :conversation="selectedConversation" :showInputBox=false />
    </div>
  </div>
</template>

<style scoped>
.chats-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}

.chats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.chats-page {
  display: flex;
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  height: 100%;
}

.channel-filters {
  display: flex;
  gap: 0.5rem;
}

.channel-filter-btn {
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.channel-filter-btn.active {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}
</style>