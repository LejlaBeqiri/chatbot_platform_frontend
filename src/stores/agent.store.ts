import { defineStore } from 'pinia';
import { AgentService } from '@/services/agent.service';
import { type Agent } from './types/agent.types';
import type { PaginationMeta } from './types/pagination.types';

interface AgentState {
  currentAgent: Agent | null;
  agents: Agent[];
  loading: boolean;
  error: string | null;
  paginationMeta: PaginationMeta;
}

export const useAgentStore = defineStore('agent', {
  state: (): AgentState => ({
    currentAgent: null,
    agents: [],
    loading: false,
    error: null,
    paginationMeta: {}
  }),

  actions: {
    async fetchAgentById(agentId: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await AgentService.getAgentByID(agentId);
        if (response.success) {
          this.currentAgent = response.data;
        } else {
          this.error = response.message || 'Failed to fetch agent';
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('Error fetching agent:', error);
      } finally {
        this.loading = false;
      }
    },

    async getAgents(page: number = 1) {
      this.loading = true;
      this.error = null;

      try {
        const response = await AgentService.getAgents(page);
        if (response.success) {
          this.agents = response.data.data;
          this.paginationMeta = response.data.meta;
          return response;
        } else {
          this.error = response.message || 'Failed to fetch agents';
          return response;
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('Error fetching agents:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAgent(agentId: number) {
      try {
        const response: { success: boolean, message?: string } = await AgentService.deleteAgent(agentId);

        if (response.success) {
          return response;
        } else {
          this.error = response.message || 'Failed to delete agent';
          return response;
        }

      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred';
        console.error('Error deleting agents:', error);
      }
    },

    clearCurrentAgent() {
      this.currentAgent = null;
    },

    toggleAgentStatus(agentId: number, newStatus: boolean) {
      return AgentService.toggleAgentStatus(agentId, newStatus);
    }
  },

  getters: {
    hasAgent(state: AgentState): boolean {
      return state.currentAgent !== null;
    },
    getAgent(state: AgentState): Agent | null {
      return state.currentAgent;
    },
    getAgentName(state: AgentState): string {
      return state.currentAgent?.name || 'Unknown Agent';
    },
    getAgentCreationDate(state: AgentState): string {
      if (!state.currentAgent?.created_at) return '';
      return new Date(state.currentAgent.created_at).toLocaleDateString();
    },
    getAllAgents(state: AgentState): Agent[] {
      return state.agents;
    },
    getPaginationMeta(state: AgentState): PaginationMeta {
      return state.paginationMeta;
    }
  }
});

