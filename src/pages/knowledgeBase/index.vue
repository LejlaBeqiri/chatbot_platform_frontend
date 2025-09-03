<template>
  <div class="flex min-h-screen w-full flex-col">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight pb-2">Knowledge Base</h1>
          <p class="text-sm text-gray-500">Manage and monitor your knowledge bases. Click on a knowledge base to view
            detailed information.</p>
        </div>
        <Button @click="handleInsert" v-if="knowledgeBases && knowledgeBases.length == 0 && !loadingData && !isAdmin">
          Create Knowledge Base
        </Button>
      </div>

      <template v-if="loadingData">
        <TableSkeleton class="mt-10" />
      </template>

      <template v-else>
        <template v-if="knowledgeBases && knowledgeBases.length === 0">
          <EmptyStates type="knowledgebase" @add="handleInsert"></EmptyStates>
        </template>
        <template v-else>
          <Card>
            <CardContent class="p-0 sm:p-6">
              <template v-if="loadingData">
                <TableSkeleton />
              </template>
              <template v-else>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead class="sm:d-none">Created</TableHead>
                      <TableHead class="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="(kb, index) in knowledgeBases" :key="index" class="cursor-pointer"
                      @click="viewKnowledgeBaseDetails(kb.id)">
                      <TableCell>
                        <div class="flex items-center gap-2">
                          <Book class="h-4 w-4 text-muted-foreground" />
                          <span class="font-medium">{{ kb.name }}</span>
                        </div>
                      </TableCell>
                      <TableCell class="sm:d-none">{{ formatDate(kb.created_at) }}</TableCell>
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
                            <DropdownMenuItem @click.stop="viewKnowledgeBaseDetails(kb.id)">
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem @click.stop="deleteKnowledgeBase(kb)">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </template>
            </CardContent>
            <!-- Pagination -->
            <div v-if="totalPages > 1 && !loadingData" class="flex justify-center py-4 border-t">
              <Pagination>
                <PaginationList class="flex items-center gap-1">
                  <PaginationFirst @click="goToPage(1)" :disabled="currentPage === 1 || loadingData" />
                  <PaginationPrev @click="goToPage(currentPage - 1)" :disabled="currentPage === 1 || loadingData" />

                  <template v-for="(item, index) in displayedPages" :key="index">
                    <PaginationListItem v-if="item.type === 'page'" :value="item.value" as-child>
                      <Button 
                        class="w-10 h-9 p-0" 
                        :variant="item.value === currentPage ? 'default' : 'outline'"
                        @click="goToPage(item.value)"
                        :disabled="loadingData"
                      >
                        {{ item.value }}
                      </Button>
                    </PaginationListItem>
                    <PaginationEllipsis v-else-if="item.type === 'ellipsis'" :key="'ellipsis-' + index" :index="index" />
                  </template>

                  <PaginationNext @click="goToPage(currentPage + 1)" 
                    :disabled="currentPage === totalPages || loadingData" />
                  <PaginationLast @click="goToPage(totalPages)" 
                    :disabled="currentPage === totalPages || loadingData" />
                </PaginationList>
              </Pagination>
            </div>
          </Card>
        </template>
      </template>

      <chatbot-confirm-dialog ref="confirmDialog" title="Please Confirm"
        description="Are your sure you want to delete this knowledgebase? If this knowledgebase is used in any of your agents, that agent will not work any longer."
        confirm-text="Delete" @confirm="handleDeleteConfirm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import TableSkeleton from "@/components/skeletons/table-skeleton.vue";
import { formatDate, calculateDisplayedPages } from "@/utils/globals";
import { MoreHorizontal, Book } from "lucide-vue-next";
import EmptyStates from "@/components/chatbot-empty-states.vue";
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
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination';
import chatbotConfirmDialog from '@/components/chatbot-confirm-dialog.vue';
import { useKnowledgeBaseStore } from '@/stores/knowledgeBase.store';
import type { KnowledgeBase } from "@/stores/types/knowledgeBase.types";
import eventBus from '@/utils/eventBus';
import { storeToRefs } from 'pinia';
import { useAuthStore } from "@/stores/auth.store";
import { KnowledgeBaseService } from '@/services/knowledge.service'; 

const router = useRouter();
const knowledgeBaseStore = useKnowledgeBaseStore();
const authStore = useAuthStore();

const { 
  knowledgeBases, 
  loading: loadingData, 
  error, 
  paginationMeta 
} = storeToRefs(knowledgeBaseStore);

const kb_delete = ref<KnowledgeBase | null>(null);
const confirmDialog = ref();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const currentPage = computed(() => paginationMeta.value?.current_page || 1);
const totalPages = computed(() => paginationMeta.value?.last_page || 1);

const displayedPages = computed(() => {
  if (!paginationMeta.value) return [];
  return calculateDisplayedPages({
    current_page: currentPage.value,
    last_page: totalPages.value
  });
});

const getKnowledgeBases = async (page: number = 1) => {
  try {
    await knowledgeBaseStore.getKnowledgeBases(page);
    if (error.value) {
      eventBus.emit('show-toast', {
        type: 'error',
        title: 'Failed to fetch knowledge bases',
        message: error.value || 'An error occurred'
      });
    }
  } catch (err) {
    console.error('Error fetching knowledge bases:', err);
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Failed to fetch knowledge bases',
      message: 'An unexpected error occurred'
    });
  }
};

const handleInsert = () => {
  router.push({ name: 'knowledgeBase.create' });
};

const viewKnowledgeBaseDetails = (kbId: number) => {
  router.push({
    name: 'knowledgebase.details',
    params: { id: kbId.toString() }
  });
};

const goToPage = async (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    await getKnowledgeBases(page);
  }
};

const deleteKnowledgeBase = (knowledgeBase: KnowledgeBase) => {
  kb_delete.value = knowledgeBase;
  confirmDialog.value?.showDialog();
};

const handleDeleteConfirm = async () => {
  if (!kb_delete.value) return;

  try {
    const response = await KnowledgeBaseService.delete(kb_delete.value.id);

    if (response.success) {
      eventBus.emit('show-toast', {
        type: 'success',
        title: 'Knowledge base deleted.',
        message: `Successfully deleted knowledgebase: ${kb_delete.value.name}`,
      });
      let pageToFetch = currentPage.value;
      if (knowledgeBases.value.length === 1 && pageToFetch > 1) {
        pageToFetch--;
      }
      await getKnowledgeBases(pageToFetch);
    } else {
      throw new Error(response.message || 'Failed to delete');
    }
  } catch (error) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: `Failed to delete knowledgebase: ${kb_delete.value.name}`,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  } finally {
    kb_delete.value = null;
  }
};

onMounted(() => {
  getKnowledgeBases(1); 
});
</script>
