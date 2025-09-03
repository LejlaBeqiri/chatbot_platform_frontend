<template>
  <div class="flex min-h-screen w-full flex-col">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight pb-2">Agents</h1>
          <p>Manage and monitor your AI agents. Click on an agent to view detailed information</p>
        </div>
        <Button @click="router.push('/user/agents/create')" v-if="agents.length == 0 && !loading && !isAdmin">Create Agent</Button>
      </div>

      <template v-if="loading">
        <TableSkeleton class="mt-10" />
      </template>

      <template v-else-if="error">
        <div class="text-center py-4">
          <p class="text-red-500">{{ error }}</p>
          <Button class="mt-4" variant="outline" @click="getAgents(currentPage)">
            Retry
          </Button>
        </div>
      </template>

      <template v-else>
        <template v-if="agents.length === 0">
          <EmptyStates type="agents" @add="handleInsert" />
        </template>
        <template v-else>
          <Card>
            <CardContent class="p-0 sm:p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead class="sm:d-none">Created</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="agent in agents" :key="agent.id" class="cursor-pointer"
                    @click="viewAgentDetails(agent.id)">
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <Bot class="h-4 w-4 text-muted-foreground" />
                        <span class="font-medium">{{ agent.name }}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center">
                        <template v-if="agent.is_active === true">
                          <Badge variant="success" :has-dot="true">
                            Active
                          </Badge>
                        </template>
                        <template v-else>
                          <Badge variant="error" :has-dot="true">
                            Not activated
                          </Badge>
                        </template>
                      </div>
                    </TableCell>
                    <TableCell class="sm:d-none">{{ formatDate(agent.created_at) }}</TableCell>
                    <TableCell class="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child @click.stop>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal class="h-4 w-4" />
                            <span class="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem @click.stop="toggleStatus(agent)">
                            {{ agent.is_active === true ? 'Deactivate' : 'Activate' }}
                          </DropdownMenuItem>
                          <DropdownMenuItem @click.stop="deleteAgent(agent)">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <!-- Add pagination UI -->
              <div v-if="totalPages > 1" class="flex items-center justify-center space-x-2 py-4">
                <Pagination>
                  <PaginationFirst @click="goToPage(1)" :disabled="currentPage === 1" />
                  <PaginationPrev @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" />
                  
                  <PaginationList>
                    <template v-for="page in displayedPages" :key="page">
                      <PaginationListItem
                        :value="Number(page)"
                        :isActive="Number(page) === currentPage"
                        @click="goToPage(Number(page))"
                      />
                    </template>
                  </PaginationList>
                  
                  <PaginationNext @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" />
                  <PaginationLast @click="goToPage(totalPages)" :disabled="currentPage === totalPages" />
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </template>
      </template>

      <chatbot-confirm-dialog
        ref="confirmDialog" 
        title="Please Confirm"
        description="Are you sure you want to delete this agent? This action cannot be undone." 
        confirm-text="Delete"
        @confirm="handleDeleteConfirm" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@components/ui/button";
import { onMounted, ref, computed } from "vue";
import type { Agent } from "@/stores/types/agent.types";
import EmptyStates from "@/components/chatbot-empty-states.vue"
import { useRouter } from "vue-router";
import { useAgentStore } from "@/stores/agent.store";
import eventBus from '@/utils/eventBus';
import chatbotConfirmDialog from '@/components/chatbot-confirm-dialog.vue';
import { formatDate } from "@/utils/globals";
import { storeToRefs } from 'pinia';
import { 
  Pagination, PaginationFirst, PaginationLast, 
  PaginationList, PaginationListItem, PaginationNext, PaginationPrev 
} from '@/components/ui/pagination';
import { calculateDisplayedPages } from "@/utils/globals";
import TableSkeleton from '@/components/skeletons/table-skeleton.vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

import {
  MoreHorizontal, Bot
} from "lucide-vue-next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const router = useRouter();
const confirmDialog = ref();
const agent_delete = ref<Agent | null>(null);

const agentStore = useAgentStore();
const { agents, loading, error, paginationMeta } = storeToRefs(agentStore);

const currentPage = computed(() => paginationMeta.value?.current_page || 1);
const totalPages = computed(() => paginationMeta.value?.last_page || 1);

const displayedPages = computed(() => {
  return calculateDisplayedPages({
    current_page: currentPage.value,
    last_page: totalPages.value
  });
});

const getAgents = async (page: number = 1) => {
  try {
    await agentStore.getAgents(page);
  } catch (error: any) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Failed to fetch agents',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

const goToPage = async (page: number | string) => {
  await getAgents(Number(page));
};

const toggleStatus = async (agent: Agent) => {
  const newStatus = agent.is_active === true ? false : true;
  const response = await agentStore.toggleAgentStatus(agent.id, newStatus);
  if (response.success) {
    await getAgents();
    eventBus.emit('show-toast', {
      type: 'success',
      title: `Status changed successfully!`,
      message: `Agent ${newStatus ? 'Actived' : 'Inactive'}.`
    });
  } else {
    eventBus.emit('show-toast', {
      type: 'error',
      title: `Failed to toggle status for agent: ${agent.name}`,
      message: 'An unexpected error occurred'
    });
  }
};

const deleteAgent = (agent: Agent) => {
  agent_delete.value = agent;
  confirmDialog.value?.showDialog();
};

const handleDeleteConfirm = async () => {
  if (!agent_delete.value) return;

  try {

    const response = await agentStore.deleteAgent(agent_delete.value.id);
    if (response == undefined) {
      eventBus.emit('show-toast', {
        type: 'error',
        title: `Failed to delete agent: ${agent_delete.value.name}`,
        message: 'An unexpected error occurred'
      });
      return;
    }
    if (response.success) {

      eventBus.emit('show-toast', {
        type: 'success',
        title: `Successfully deleted agent: ${agent_delete.value.name}`,
        message: 'Successfully deleted agent.'
      });
      await getAgents();
    } else {
      throw new Error(response.message || 'Failed to delete agent.');
    }
  } catch (error) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: `Failed to delete agent: ${agent_delete.value.name}`,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  } finally {
    agent_delete.value = null;
  }
};

const viewAgentDetails = (agentId: number) => {
  router.push(`/user/agents/${agentId}`);
};


onMounted(() => {
  getAgents(1);
});

const handleInsert = () => {
  router.push({ name: 'agents.create' })
}
</script>
