import type { Tenant } from "@/stores/types/auth.types";
import type { Agent } from "@/stores/types/agent.types";
import type { PaginatedApiResponse } from "./pagination.types";


export interface ChatMessage {
  id: number;
  user_message: string;
  bot_response: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number,
  tenant: Tenant,
  chats: ChatMessage[],
  user_identifier: string;
  created_at: string,
  updated_at: string,
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type ConversationsResponse = ApiResponse<Conversation[]>;
export type ConversationResponse = ApiResponse<Conversation>;

export type ChatMessageResponse = ApiResponse<ChatMessage>;
export type ChatMessagesResponse = ApiResponse<ChatMessage[]>;

export type ChatbotResponse = ApiResponse<Agent>;
export type ChatbotsResponse = PaginatedApiResponse<Agent>;
