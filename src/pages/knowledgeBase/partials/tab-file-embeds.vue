<template>
    <div>
        <div v-if="hasUnsavedChanges" class="mb-4">
            <chatbotInfoText type="destructive">
                <p><span>Unsaved Changes</span><br> You have unsaved changes. Please save or discard them before leaving
                    this page.</p>
            </chatbotInfoText>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Document Embeddings</CardTitle>
                <CardDescription class="max-w-2xl">
                    These are the chunks of information extracted from your files and converted into vector embeddings.
                    They help the chatbot understand and retrieve relevant answers.
                </CardDescription>
            </CardHeader>
            <div v-if="isLoadingEmbeddings">
                <CardContent>
                    <div class="grid gap-4">
                        <div class="flex items-center justify-between" v-for="i in 6" :key="i">
                            <Skeleton class="h-5 w-24" />
                            <Skeleton class="h-5 w-32" />
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <Skeleton class="h-5 w-24 mb-2" />
                                <Skeleton class="h-4 w-64" />
                            </div>
                            <Skeleton class="h-5 w-10" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter class="border-t px-6 py-4 flex items-center justify-between">
                    <Skeleton class="h-9 w-20" />
                    <Skeleton class="h-9 w-28" />
                </CardFooter>
            </div>


            <div v-else>
                <CardContent>
                    <div v-if="!isAdmin" class="mb-6">
                        <Button @click="addNewEmbedding" variant="outline" class="w-full">
                            <PlusIcon class="mr-2 h-4 w-4" />
                            Add New Embedding
                        </Button>
                    </div>
                    <div class="space-y-6">
                        <div v-if="newEmbeddings.length > 0" class="border-2 border-primary rounded-lg p-4 mb-8">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="text-lg font-medium">New Embeddings</h4>
                                <div class="flex space-x-2">
                                    <Button @click="cancelAllNewEmbeddings" variant="ghost" size="sm">
                                        Cancel All
                                    </Button>
                                    <Button @click="saveAllNewEmbeddings" variant="default" size="sm"
                                        :disabled="!hasValidNewEmbeddings || isSavingNewEmbeddings"
                                        :loading="isSavingNewEmbeddings">
                                        Save
                                    </Button>
                                </div>
                            </div>

                            <!-- List of new embeddings -->
                            <div class="space-y-4">
                                <div v-for="(embedding, index) in newEmbeddings" :key="embedding.tempId"
                                    class="border border-gray-200 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <h5 class="font-medium">New Embedding #{{ index + 1 }}</h5>
                                        <div class="flex space-x-2">
                                            <Badge variant="outline">NEW</Badge>
                                            <Button @click="() => removeNewEmbedding(index)" variant="ghost" size="icon"
                                                class="h-8 w-8">
                                                <XIcon class="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div class="grid gap-4">
                                        <div class="grid gap-2">
                                            <div class="flex justify-between items-center">
                                                <Label :for="`new-prompt-${index}`">Prompt</Label>
                                                <span class="text-xs text-gray-500">{{ embedding.metadata.prompt?.length
                                                    || 0 }} chars</span>
                                            </div>
                                            <Input :id="`new-prompt-${index}`" v-model="embedding.metadata.prompt"
                                                class="w-full" />
                                            <!-- Basic validation indicator can be added here -->
                                        </div>
                                        <div class="grid gap-2">
                                            <div class="flex justify-between items-center">
                                                <Label :for="`new-message-${index}`">Source Text</Label>
                                                <span class="text-xs text-gray-500">{{
                                                    embedding.metadata.source_text?.length || 0 }} chars</span>
                                            </div>
                                            <Textarea :id="`new-message-${index}`"
                                                v-model="embedding.metadata.source_text" class="w-full min-h-[100px]" />
                                            <!-- Basic validation indicator can be added here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Existing Embeddings Section -->
                        <div v-if="currentEmbeddings.length > 0" class="mt-6">
                            <h4 class="text-lg font-medium mb-4">Existing Embeddings (Page {{ currentPage }}/{{
                                totalPages }})</h4>
                            <div v-for="embed in currentEmbeddings" :key="embed.id" class="border rounded-lg p-4 mb-4">
                                <div class="flex justify-between items-center mb-2">
                                    <h5 class="font-medium">Embedding #{{ embed.id }}</h5>
                                    <!-- <Badge variant="secondary">{{ embed.status }}</Badge> -->
                                </div>
                                <div class="grid gap-4">
                                    <div class="grid gap-2">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium text-sm">Prompt</div>
                                            <span class="text-xs text-gray-500">{{ embed.metadata?.prompt?.length || 0
                                                }} chars</span>
                                        </div>
                                        <div
                                            class="p-3 bg-gray-50 border rounded-md whitespace-pre-wrap cursor-not-allowed">
                                            {{ embed.metadata?.prompt || 'N/A' }}
                                        </div>
                                    </div>
                                    <div class="grid gap-2">
                                        <div class="flex justify-between items-center">
                                            <div class="font-medium text-sm">Source Text</div>
                                            <span class="text-xs text-gray-500">{{ embed.metadata?.source_text?.length
                                                || 0 }} chars</span>
                                        </div>
                                        <div
                                            class="p-3 bg-gray-50 border rounded-md whitespace-pre-wrap min-h-[100px] cursor-not-allowed">
                                            {{ embed.metadata?.source_text || 'N/A' }}
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <div class="text-sm text-muted-foreground">
                                            Created: {{ formatDate(embed.created_at) }}
                                        </div>
                                        <Button v-if="!isAdmin" @click="() => confirmDeleteEmbedding(embed)" variant="destructive" 
                                            size="sm">
                                            <TrashIcon class="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="!isLoadingEmbeddings && currentEmbeddings.length === 0">
                            <p class="text-center text-muted-foreground py-4">No embeddings found for this knowledge
                                base.</p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter v-if="totalPages > 1" class="flex justify-center py-4 border-t">
                    <Pagination>
                        <PaginationList class="flex items-center gap-1">
                            <PaginationFirst @click="goToPage(1)"
                                :disabled="currentPage === 1 || isLoadingEmbeddings" />
                            <PaginationPrev @click="goToPage(currentPage - 1)"
                                :disabled="currentPage === 1 || isLoadingEmbeddings" />

                            <template v-for="(item, index) in displayedPages" :key="index">
                                <PaginationListItem v-if="item.type === 'page' && typeof item.value === 'number'"
                                    :value="item.value" as-child>
                                    <Button class="w-10 h-9 p-0"
                                        :variant="item.value === currentPage ? 'default' : 'outline'"
                                        @click="goToPage(item.value)" :disabled="isLoadingEmbeddings">
                                        {{ item.value }}
                                    </Button>
                                </PaginationListItem>
                                <PaginationEllipsis v-else-if="item.type === 'ellipsis'" :key="'ellipsis-' + index"
                                    :index="index" />
                            </template>

                            <PaginationNext @click="goToPage(currentPage + 1)"
                                :disabled="currentPage === totalPages || isLoadingEmbeddings" />
                            <PaginationLast @click="goToPage(totalPages)"
                                :disabled="currentPage === totalPages || isLoadingEmbeddings" />
                        </PaginationList>
                    </Pagination>
                </CardFooter>

                <CardFooter class="border-t px-6 py-4 flex items-center justify-between">
                    <div class="flex space-x-2">
                        <Button @click="router.back()"
                            :disabled="isLoadingEmbeddings || isSavingNewEmbeddings">Back</Button>
                    </div>
                </CardFooter>
            </div>
        </Card>

        <chatbotConfirmDialog ref="confirmEmbeddingDeleteDialog" title="Please Confirm Deletion"
            description="Are you sure you want to delete this embedding? This action cannot be undone."
            confirm-text="Yes, Delete" @confirm="handleEmbeddingDelete" />
    </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";

import chatbotInfoText from "@/components/chatbot-info-text.vue";
import {
    Pagination, PaginationEllipsis, PaginationFirst, PaginationLast, PaginationList, PaginationListItem, PaginationNext, PaginationPrev,
} from '@/components/ui/pagination'
import chatbotConfirmDialog from '@/components/chatbot-confirm-dialog.vue';


import { PlusIcon, TrashIcon, XIcon } from "lucide-vue-next";

import { useRouter, useRoute } from "vue-router";

import emitter from '@events'


import type { Embedding } from "@/stores/types/knowledgeBase.types";

import { ref, onMounted, computed } from "vue";
import { storeToRefs } from 'pinia';


import { formatDate, calculateDisplayedPages } from "@/utils/globals";


import { useKnowledgeBaseStore } from "@/stores/knowledgeBase.store"
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const knowledgeBaseStore = useKnowledgeBaseStore();
const {
  embeddings: currentEmbeddings,
  embeddingsPaginationMeta,
  loadingEmbeddings: isLoadingEmbeddings,
} = storeToRefs(knowledgeBaseStore)


const router = useRouter();
const route = useRoute();
const confirmEmbeddingDeleteDialog = ref();
const embeddingToDelete = ref<Embedding | null>(null);
const newEmbeddings = ref<Array<{ tempId: string; metadata: { prompt: string; source_text: string } }>>([]);
const isSavingNewEmbeddings = ref(false);


const knowledgeBaseId = computed(() => Number(route.params.id));

const hasUnsavedChanges = computed(() => {
    return newEmbeddings.value.length > 0;
});


const hasValidNewEmbeddings = computed(() => {
    if (newEmbeddings.value.length === 0) return false;
    return newEmbeddings.value.every(embed =>
        embed.metadata?.prompt?.trim() !== '' &&
        embed.metadata?.source_text?.trim() !== ''
    );
});


const currentPage = computed(() => embeddingsPaginationMeta.value?.current_page || 1);
const totalPages = computed(() => embeddingsPaginationMeta.value?.last_page || 1);

const displayedPages = computed(() => {
    return calculateDisplayedPages({
        current_page: currentPage.value,
        last_page: totalPages.value
    });
});

const fetchEmbeddingsForPage = async (page: number) => {
    if (!knowledgeBaseId.value) return;
    try {
        await knowledgeBaseStore.fetchEmbeddings(knowledgeBaseId.value, page);
    } catch (error) {
        console.error('Error fetching page:', error);
        emitter.emit('show-toast', {
            type: 'error',
            title: 'Failed to load embeddings',
            message: 'An error occurred while loading embeddings.'
        });
    }
};

const goToPage = async (page: number | string) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        await fetchEmbeddingsForPage(page);
    }
};

const addNewEmbedding = () => {
    newEmbeddings.value.push({
        tempId: 'new-' + Date.now(),
        metadata: {
            prompt: '',
            source_text: ''
        }
    });
};

const removeNewEmbedding = (index: number) => {
    newEmbeddings.value.splice(index, 1);
};

const cancelAllNewEmbeddings = () => {
    if (newEmbeddings.value.length > 0) {
        newEmbeddings.value = [];
    }
};

const saveAllNewEmbeddings = async () => {
    if (!hasValidNewEmbeddings.value || !knowledgeBaseId.value) return;

    isSavingNewEmbeddings.value = true;
    try {
        const embeddingsToSave = newEmbeddings.value.map(embed => ({
            metadata: {
                prompt: embed.metadata.prompt.trim(),
                source_text: embed.metadata.source_text.trim() // Ensure it matches backend/type
            }
        }));

        await knowledgeBaseStore.addEmbeddings(knowledgeBaseId.value, embeddingsToSave);

        newEmbeddings.value = [];

        emitter.emit('show-toast', {
            type: 'success',
            title: 'Successfully saved new embeddings',
            message: 'Your new embeddings have been saved successfully.'
        });

    } catch (error) {
        console.error('Error saving new embeddings:', error);
        emitter.emit('show-toast', {
            type: 'error',
            title: knowledgeBaseStore.errorEmbeddings || 'Failed to save new embeddings',
            message: 'An error occurred while saving new embeddings.'
        });
    } finally {
        isSavingNewEmbeddings.value = false;
    }
};


const confirmDeleteEmbedding = (embedding: Embedding) => {
    embeddingToDelete.value = embedding;
    confirmEmbeddingDeleteDialog.value?.showDialog();
};

const handleEmbeddingDelete = async () => {
    if (!embeddingToDelete.value || !knowledgeBaseId.value) return;

    const idToDelete = embeddingToDelete.value.id;
    embeddingToDelete.value = null;

    try {
        await knowledgeBaseStore.deleteEmbedding(knowledgeBaseId.value, idToDelete);
        emitter.emit('show-toast', {
            type: 'success',
            title: 'Embedding deleted successfully',
            message: 'The embedding has been deleted.'
        });
    } catch (error) {
        console.error('Error deleting embedding:', error);
        emitter.emit('show-toast', {
            type: 'error',
            title: knowledgeBaseStore.errorEmbeddings || 'Failed to delete embedding',
            message: 'An error occurred while deleting the embedding.'
        });
    }
};


onMounted(() => {
    fetchEmbeddingsForPage(1);
});



</script>

<style scoped></style>