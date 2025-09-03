import { api } from "@/lib/server";
import type { ChatbotResponse, ChatbotsResponse } from "@/stores/types/chat.types";


interface ICreateAgent {
  name: string;
  description?: string;
  temperature: number;
  chatbot_system_prompt?: {
    context?: string;
    rules: string[];
  };
}


export class AgentService {
  private static readonly BASE_PATH = "/api/user";

  static async createAgent(agentData: ICreateAgent): Promise<ChatbotResponse> {
    const { data } = await api.post<ChatbotResponse>(
      `${this.BASE_PATH}/chatbots`,
      agentData
    );
    console.log("Agent created successfully");
    console.log(data);
    return data;
  }

  static async getAgentByID(agentID: number): Promise<ChatbotResponse> {
    const { data } = await api.get<ChatbotResponse>(
      `${this.BASE_PATH}/chatbots/${agentID}`
    );
    return data;
  }

  static async getAgents(page: number = 1): Promise<ChatbotsResponse> {
    const { data } = await api.get<ChatbotsResponse>(
      `${this.BASE_PATH}/chatbots`,
      {
        params: {
          page
        }
      }
    );
    return data;
  }

  static async deleteAgent(agentId: number): Promise<{ success: boolean, message?: string }> {
    const { data } = await api.delete<{ success: boolean, message?: string }>(
      `${this.BASE_PATH}/chatbots/${agentId}`
    );
    return data;
  }

  static async toggleAgentStatus(agentId: number, newStatus: boolean): Promise<{ success: boolean, message?: string }> {
    const { data } = await api.post<{ success: boolean, message?: string }>(
      `${this.BASE_PATH}/chatbots/${agentId}/set-active-status`,
      { is_active: newStatus }
    );
    return data;
  }

  static async updateAgent(agentId: number, agentData: ICreateAgent): Promise<ChatbotResponse> {
    const { data } = await api.put<ChatbotResponse>(
      `${this.BASE_PATH}/chatbots/${agentId}`,
      agentData
    );
    return data;
  }
}
