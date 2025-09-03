<template>


  <div class="grid grid-cols-[1fr,400px] gap-6 ">
    <Tabs default-value="file_info" class="w-full ">
      <TabsList class="grid w-full grid-cols-5 mb-4 ">
        <TabsTrigger value="file_info">Knowledgebase info</TabsTrigger>
        <TabsTrigger value="embeddings">Emeddings</TabsTrigger>


      </TabsList>
      <div class="mt-6">
        <TabsContent value="file_info">
          <div class="flex min-h-screen w-full flex-col">
            <main class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4">
              <div v-if="loadingData">
                <TableSkeleton />
              </div>
              <div v-else-if="!knowledgeBase">
                <p>Knowledge base not found</p>
                <Button class="mt-4" @click="router.back()">Back</Button>
              </div>
              <div v-else class="grid w-full max-w-6xl gap-2">
                <template v-if="knowledgeBase">
                  <h1 class="text-3xl font-semibold">{{ knowledgeBase.name }}</h1>
                  <div class="grid w-full max-w-6xl items-start gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Knowledge Base Information</CardTitle>
                        <CardDescription>
                          View and manage your knowledge base details
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div class="grid gap-4">
                          <div>
                            <h3 class="font-medium">Name</h3>
                            <p class="text-sm text-muted-foreground">{{ knowledgeBase.name }}</p>
                          </div>
                          <div>
                            <h3 class="font-medium">Description</h3>
                            <p class="text-sm text-muted-foreground">{{ knowledgeBase.description || 'No description' }}
                            </p>
                          </div>
                          <div>
                            <h3 class="font-medium">Created</h3>
                            <p class="text-sm text-muted-foreground">{{ formatDate(knowledgeBase.created_at) }}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter class="border-t px-6 py-4">
                        <Button @click="router.back()">Back</Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Files</CardTitle>
                        <CardDescription>
                          Manage files in this knowledge base
                        </CardDescription>
                      </CardHeader>
                      <CardContent class="p-0 sm:p-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead class="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow v-for="file in knowledgeBase.files" :key="file.id">
                              <TableCell>
                                <div class="flex items-center gap-2">
                                  <FileIcon class="h-4 w-4 text-muted-foreground" />
                                  <span class="font-medium">{{ file.name }}</span>
                                </div>
                              </TableCell>
                              <TableCell>{{ formatFileSize(file.size) }}</TableCell>
                              <TableCell>
                                <Badge :variant="getEmbeddingStatusVariant(file.embedding_status)"
                                  :has-dot="file.embedding_status === 'completed' || file.embedding_status === 'failed'">
                                  {{ getEmbeddingStatusText(file.embedding_status) }}
                                </Badge>
                              </TableCell>
                              <TableCell>{{ file.mime_type }}</TableCell>
                              <TableCell class="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger as-child>
                                    <Button size="icon" variant="ghost">
                                      <MoreHorizontal class="h-4 w-4" />
                                      <span class="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem @click="downloadFile(file)">
                                      <Download class="mr-2 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem @click="deleteFile(file)">
                                      <Trash2 class="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>

                          </TableBody>
                        </Table>
                      </CardContent>
                      <CardFooter class="border-t px-6 py-4">
                        <Button @click="openUploadModal">Upload Document</Button>
                        <ModalFileUpload ref="ref_modal_file_upload" @uploaded="handleUploadComplete" />
                      </CardFooter>
                    </Card>
                  </div>
                </template>
              </div>
            </main>
            <chatbotConfirmDialog ref="confirmDialog" title="Delete File"
              description="Are you sure you want to delete this file? This action cannot be undone."
              confirm-text="Delete" @confirm="handleDeleteConfirm" />
          </div>
        </TabsContent>
        <TabsContent value="embeddings">
          <FileEmbedsSection />
        </TabsContent>
      </div>
    </Tabs>

  </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { KnowledgeBaseService } from "@/services/knowledge.service";
import type { KnowledgeBase } from "@/stores/types/knowledgeBase.types";
import type { File } from "@/stores/types/file.types";
import { File as FileIcon, MoreHorizontal, Download, Trash2 } from "lucide-vue-next";
import chatbotConfirmDialog from '@/components/chatbot-confirm-dialog.vue';
import eventBus from '@/utils/eventBus';
import TableSkeleton from "@/components/skeletons/table-skeleton.vue";
import ModalFileUpload from "./partials/modal-upload-file.vue";
import FileEmbedsSection from "./partials/tab-file-embeds.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/globals";


type BadgeVariant = 'success' | 'destructive' | 'secondary' | 'outline' | 'default';


const getEmbeddingStatusVariant = (status: string | null | undefined): BadgeVariant => {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'destructive';
  return 'secondary';
};


const getEmbeddingStatusText = (status: string | null | undefined): string => {
  if (status === 'completed') return 'Completed';
  if (status === 'failed') return 'Failed';
  return 'Embedding not available';
};

const loadingData = ref(true);
const router = useRouter();
const knowledgeBase = ref<KnowledgeBase | null>(null);
const ref_modal_file_upload = ref<InstanceType<typeof ModalFileUpload> | null>(null);

const getKnowledgeBase = async () => {
  try {
    const knowledgeBaseId = Number(router.currentRoute.value.params.id);
    loadingData.value = true;
    const result = await KnowledgeBaseService.getKnowledgeBaseByID(knowledgeBaseId);
    if (result.success) {
      knowledgeBase.value = result.data;
    } else {
      eventBus.emit('show-toast', {
        type: 'error',
        title: 'Failed to load knowledge base',
        message: result.message || 'Knowledge base not found'
      });
    }
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Failed to load knowledge base',
      message: 'An unexpected error occurred'
    });
  } finally {
    loadingData.value = false;
  }
};


onMounted(() => {
  getKnowledgeBase();
});



const fileToDelete = ref<File | null>(null);
const confirmDialog = ref();

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const downloadFile = async (file: File) => {
  if (!knowledgeBase.value) return;

  try {
    const response = await KnowledgeBaseService.downloadFile(file.id, knowledgeBase.value.id);
    if (response.success) {
      const blob = new Blob([response.data], { type: file.mime_type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Failed to download file',
      message: error instanceof Error ? error.message : 'An error occurred while downloading the file'
    });
  }
};

const deleteFile = (file: File) => {
  fileToDelete.value = file;
  confirmDialog.value?.showDialog();
};

const handleDeleteConfirm = async () => {
  if (!fileToDelete.value || !knowledgeBase.value?.id) {
    console.error('File or Knowledge Base ID missing for deletion.');
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Error',
      message: 'Cannot delete file: Missing information.'
    });
    return;
  }

  try {
    const response = await KnowledgeBaseService.deleteFile(fileToDelete.value.id, knowledgeBase.value.id);
    if (response.success) {
      eventBus.emit('show-toast', {
        type: 'success',
        title: 'File deleted successfully',
        message: 'The file has been deleted from the knowledge base'
      });
      await getKnowledgeBase();
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Failed to delete file',
      message: 'An error occurred while deleting the file',
    });
  } finally {
    fileToDelete.value = null;
  }
};


const openUploadModal = () => {
  if (knowledgeBase.value && knowledgeBase.value.id && ref_modal_file_upload.value) {
    ref_modal_file_upload.value.openModal(knowledgeBase.value.id);
  } else {
    console.error('Cannot open modal: Knowledge base data or modal ref is not available.');
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Error',
      message: 'Knowledge base details not loaded.'
    });
  }
};

const handleUploadComplete = () => {
  getKnowledgeBase();
};
</script>