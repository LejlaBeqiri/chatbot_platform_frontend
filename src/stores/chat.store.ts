import { defineStore } from 'pinia';
import { type ChatMessage } from './types/chat.types';

interface ChatState {
  currentChat: ChatMessage | null;
  chats: ChatMessage[];
  loading: boolean;
  error: string | null;
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    currentChat: null,
    chats: [],
    loading: false,
    error: null,
  }),

  actions: {
    clearCurrentChat() {
      this.currentChat = null;
    }
  },

  getters: {
    hasChat: (state) => state.currentChat !== null,
    getChat: (state) => state.currentChat,
  }
});