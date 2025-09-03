export interface Statistics {
  total_conversations: number;
  total_active_agents: number;
  total_knowledge_bases: number;
  total_tenants: number;
}

export interface ConversationHistory {
  date: string;
  total: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type StatisticsResponse = ApiResponse<Statistics>;
export type ConversationHistoryResponse = ApiResponse<ConversationHistory[]>;