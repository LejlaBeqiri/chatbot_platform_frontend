import { defineStore } from "pinia";
import type { Conversation } from "./types/chat.types";
import { ConversationService } from "@/services/conversation.service";
import { ChatService } from "@/services/chat.service";
import { useAgentStore } from "./agent.store";
import eventBus from '@/utils/eventBus';
interface Message {
  id: number | string;
  user_message?: string;
  bot_response?: string;
  created_at: string;
  updated_at: string;
}

interface ConversationState {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
  isStreamingMessage: boolean;
}
export const useConversationStore = defineStore('conversation', {
  state: (): ConversationState => ({
    currentConversation: null,
    conversations: [],
    messages: [],
    loading: false,
    sendingMessage: false,
    error: null,
    isStreamingMessage: false,
  }),

  actions: {
    async clearConversation() {
      if (!this.currentConversation?.id) {
        return { success: false, message: 'No active conversation found' };
      }

      try {
        const response = await ConversationService.clearConversation();
        if (response.success) {
          this.messages = [];
          eventBus.emit("show-toast", {
            type: "success",
            title: "Success",
            message: "Chat history cleared successfully"
          });
          return { success: true, message: response.message };
        } else {
          eventBus.emit("show-toast", {
            type: "error",
            title: "Error",
            message: response.message || "Failed to clear chat history"
          });
          return { success: false, message: response.message };
        }
      } catch (error: any) {
        const errorMessage = error.message || "An unexpected error occurred";
        eventBus.emit("show-toast", {
          type: "error",
          title: "Error",
          message: errorMessage
        });
        return { success: false, message: errorMessage };
      }
    },

    async fetchConversations(agentId: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await ConversationService.getConversations(agentId);

        if (response.success) {
          this.conversations = response.data;
        } else {
          this.error = response.message || 'Failed to fetch conversations';
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('Error fetching conversations:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchConversationMessages(conversationId: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await ConversationService.getConversationMessages(conversationId);
        if (response.success) {
          this.messages = response.data;
        } else {
          this.error = response.message || 'Failed to fetch chat messages';
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('Error fetching chat messages:', error);
      } finally {
        this.loading = false;
      }
    },

    setCurrentConversation(conversation: Conversation | null) {
      this.currentConversation = conversation;

      this.messages = [];
    },

    addMessage(message: Message) {
      this.messages.push(message);
    },

    async sendMessage(messageContent: string) {
      const agentStore = useAgentStore();

      if (!agentStore.currentAgent?.ulid) {
        this.error = "Agent ULID is missing.";
        console.error("sendMessage: Agent ULID missing.");
        return;
      }


      const agentUlid = agentStore.currentAgent.ulid;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        user_message: messageContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.addMessage(userMessage);


      const botMessageId = `bot-${Date.now()}`;
      const botMessagePlaceholder: Message = {
        id: botMessageId,
        bot_response: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.addMessage(botMessagePlaceholder);

      this.sendingMessage = true;
      this.error = null;
      this.isStreamingMessage = true;

      try {
        await ChatService.streamMessage(
          agentUlid,
          messageContent,
          (chunk: string) => {
            const messageIndex = this.messages.findIndex(m => m.id === botMessageId);
            if (messageIndex !== -1) {
              this.messages[messageIndex].bot_response += chunk;

            }
          },
          () => {
            this.sendingMessage = false;
            const messageIndex = this.messages.findIndex(m => m.id === botMessageId);
            if (messageIndex !== -1) {
              this.messages[messageIndex].created_at = new Date().toISOString();
            }
            console.log("Stream ended.");
          },
          // --- onError ---
          (error: string | Event | Error) => {
            let errorMessage = 'An unknown stream error occurred.';


            if (typeof error === 'string') {
              errorMessage = error;
              console.error('Stream error callback (string):', error);
            } else if (error instanceof Event) {

              errorMessage = `Stream connection event error (type: ${error.type}). Check browser console.`;
              console.error('Stream error callback (Event):', error);
            } else if (error instanceof Error) {

              errorMessage = error.message;
              console.error('Stream error callback (Error):', error);
            } else {

              console.error('Stream error callback (unknown type):', error);
            }

            this.error = `Stream failed: ${errorMessage}`;
            this.sendingMessage = false;
            eventBus.emit("show-toast", {
              type: "error",
              title: "API Key Missing",
              message: errorMessage,
            });
            const messageIndex = this.messages.findIndex(m => m.id === botMessageId);
            if (messageIndex !== -1) {
              if (this.messages[messageIndex].bot_response === '') {

                this.messages.splice(messageIndex, 1);
              } else {

                this.messages[messageIndex].bot_response += `\n\n**Error:** Stream interrupted.`;
              }
            }
          }
        );
      } catch (error: any) {
        console.error('Error initiating stream message:', error);
        this.error = error.message || 'Failed to initiate message stream';
        this.sendingMessage = false;

        const messageIndex = this.messages.findIndex(m => m.id === botMessageId);
        if (messageIndex !== -1) {
          this.messages.splice(messageIndex, 1);
        }
        this.messages = this.messages.filter(m => m.id !== userMessage.id);
      } finally {
        this.isStreamingMessage = false;
      }
    },

    async getPlaygroundConversation() {

      this.loading = true;
      this.error = null;
      const agentId = useAgentStore().currentAgent?.id || 0;

      try {
        const response = await ConversationService.getTenantConversation(agentId);
        console.log("Playground conversation response:", response.data);
        if (response.success) {
          this.currentConversation = response.data;
        } else {
          this.error = response.message || 'Failed to fetch conversations';
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('Error fetching conversations:', error);
      } finally {
        this.loading = false;
      }

      return this.currentConversation;

    }
  },

  getters: {
    hasConversation: (state) => state.currentConversation !== null,
    getConversation: (state) => state.currentConversation,
    getConversationMessages: (state) => state.messages,
    isSendingMessage: (state) => state.sendingMessage,
  }
});