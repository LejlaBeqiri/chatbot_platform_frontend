import { api } from "@/lib/server";
import type { ConversationsResponse, ChatMessagesResponse, ConversationResponse } from "@/stores/types/chat.types";

export class ConversationService {
  private static readonly BASE_PATH = "/api/user";

  static async getConversations(agentId: number): Promise<ConversationsResponse> {
    const { data } = await api.get<ConversationsResponse>(
      `${this.BASE_PATH}/conversations?chatbot_id=${agentId}&limit=10`
    );

    return data;
  }

  static async getTenantConversation(agentId: number): Promise<ConversationResponse> {
    const { data } = await api.get<ConversationResponse>(
      `${this.BASE_PATH}/playground/chatbot/${agentId}`
    );

    return data;
  }

  static async getConversationMessages(conversationId: number): Promise<ChatMessagesResponse> {
    const { data } = await api.get<ChatMessagesResponse>(
      `${this.BASE_PATH}/conversations/${conversationId}/chat-messages`
    );
    return data;
  }

  static async clearConversation(): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `${this.BASE_PATH}/playground/conversations-messages`
    );
    return data;
  }
}
