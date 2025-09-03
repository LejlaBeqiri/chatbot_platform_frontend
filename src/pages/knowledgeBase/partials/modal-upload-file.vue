<template>
  <Dialog v-model:open="isOpen" @update:open="handleDialogClose">
    <DialogContent class="sm:max-w-[640px]">
      <DialogHeader>
        <DialogTitle>Upload document(s)</DialogTitle>
        <DialogDescription>
          Supported formats: PDF, DOC, DOCX, XLS, XLSX, JSON, JSONL, TXT, MD. Max 5MB per file.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div
          class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer h-52"
          @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
          <input ref="fileInput" type="file" class="hidden" :accept="acceptedFileTypes" multiple
            @change="handleFileSelect" />
          <div v-if="selectedFiles.length === 0" class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload class="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <p class="text-sm font-medium mb-1">Drag and drop files here or click</p>
            <p class="text-xs text-gray-500">Upload documents to your knowledge base</p>
            <Button variant="outline" class="mt-4" size="sm" @click.stop="triggerFileInput">Select files</Button>
          </div>

          <div v-else class="w-full overflow-y-auto max-h-full">
            <p class="text-sm font-medium mb-2">Selected files:</p>
            <ul>
              <li v-for="(file, index) in selectedFiles" :key="index" class="flex items-center gap-2 mb-1 text-sm">
                <File class="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span class="truncate">{{ file.name }}</span>
                <Button variant="ghost" size="xs" class="ml-auto" @click.stop="removeFile(index)">
                  <XIcon />
                </Button>
              </li>
            </ul>
            <!-- <Progress :value="uploadProgress" class="w-full mt-3" /> -->
            <Button variant="outline" size="sm" class="mt-3 w-full" @click.stop="clearFiles">Clear selection</Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" :disabled="isLoading || selectedFiles.length === 0" @click="handleUpload">
          <Loader v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)` }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Loader, Upload, File, XIcon } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KnowledgeBaseService } from "@/services/knowledge.service";
import eventBus from '@/utils/eventBus';

const MAX_FILE_SIZE = 5000 * 1024; 
const isLoading = ref(false);
const isOpen = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const uploadProgress = ref(Number(0));
const currentKnowledgeBaseId = ref<number | null>(null);

const acceptedFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.json,.jsonl,.txt,.md";
const validExtensions = acceptedFileTypes.split(',').map(ext => ext.trim().substring(1));

const triggerFileInput = () => {
  fileInput.value?.click();
};

const isFileValid = (file: File): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !validExtensions.includes(fileExtension)) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Invalid file type',
      message: `File "${file.name}" has an unsupported format.`
    });
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'File too large',
      message: `File "${file.name}" exceeds the 5MB limit.`
    });
    return false;
  }
  return true;
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    selectedFiles.value = [];
    uploadProgress.value = 0;
    for (const file of Array.from(input.files)) {
      if (isFileValid(file)) {
        selectedFiles.value.push(file);
      }
    }
    input.value = '';
  }
};

const handleFileDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files) {
    selectedFiles.value = [];
    uploadProgress.value = 0;
    for (const file of Array.from(files)) {
      if (isFileValid(file)) {
        selectedFiles.value.push(file);
      }
    }
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
}

const clearFiles = () => {
  selectedFiles.value = [];
  uploadProgress.value = 0;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0 || currentKnowledgeBaseId.value === null) {
    console.error('No files selected or knowledge base ID missing.');
    return;
  }

  isLoading.value = true;
  uploadProgress.value = 0;

  try {
    const result = await KnowledgeBaseService.uploadDocuments(
      selectedFiles.value,
      currentKnowledgeBaseId.value
    );

    if (result.success) {
      uploadProgress.value = 100;
      eventBus.emit('show-toast', {
        type: 'success',
        title: `Uploaded successfully`,
        message: `${selectedFiles.value.length} file(s) uploaded successfully`
      });
      emit('submit');
      emit('uploaded');
      isOpen.value = false;
    } else {
      eventBus.emit('show-toast', {
        type: 'warning',
        title: 'Upload issue',
        message: result.message || 'Some files may not have been processed correctly.'
      });
    }
  } catch (error: any) {
    console.error("Upload failed:", error);
    let errorMessage = 'There was an unexpected error uploading your files. Please try again.';
    if (error.response && error.response.status === 422 && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      const messages = Object.values(errors).flat();
      errorMessage = messages.join(' ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Upload failed',
      message: errorMessage
    });
  } finally {
    isLoading.value = false;
  }
};

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'closed'): void;
  (e: 'uploaded'): void;
}>();

const openModal = (knowledgeBaseId: number) => {
  currentKnowledgeBaseId.value = knowledgeBaseId;
  selectedFiles.value = [];
  uploadProgress.value = 0;
  isLoading.value = false;
  isOpen.value = true;
};

defineExpose({
  openModal,
});

const handleDialogClose = (open: boolean) => {
  if (!open) {
    selectedFiles.value = [];
    uploadProgress.value = 0;
    isLoading.value = false;
    currentKnowledgeBaseId.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    emit('closed');
  }
};
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  min-width: 0;
}

button.size-xs {
  padding: 0.1rem 0.25rem;
  height: auto;
}
</style>