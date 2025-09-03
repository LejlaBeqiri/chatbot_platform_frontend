<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import ChatInterface from '@components/ChatInterface.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useConversationStore } from '@/stores/conversation.store';
import { useAgentStore } from '@/stores/agent.store';

const authStore = useAuthStore();
const conversationStore = useConversationStore();
const agentStore = useAgentStore()
const tenantId = computed(() => authStore.user?.tenant?.id);
const conversation = ref(null);
const agentId = computed(() => agentStore.currentAgent?.id)

onMounted(async () => {
  if (tenantId.value || authStore.user?.role == 'admin') {
    const tenantConversation = await conversationStore.getPlaygroundConversation();
    conversation.value = tenantConversation;
  }
});
</script>

<template>
  <div class="playground-container">
    <div class="playground-header">
      <h2 class="text-xl font-semibold">Playground</h2>
      <p class="text-sm text-gray-500">Test your chatbot configuration here</p>
    </div>
    
    <div class="playground-chat">
      <ChatInterface 
        :conversation="conversation" 
        :showInputBox="true"
        :agentId="agentId"
      />
    </div>
  </div>
</template>

<style scoped>
.playground-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

.playground-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.playground-chat {
  flex: 1;
  overflow: hidden;
}
</style>
