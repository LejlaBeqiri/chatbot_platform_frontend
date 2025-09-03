<template>
  <div class="flex min-h-screen w-full flex-col gap-8 py-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold tracking-tight">Keys</h1>
          <p class="text-sm text-muted-foreground mt-1">Manage and securely store the API keys for your integrations</p>
        </div>
        <Button v-if="!loadingData" size="lg" class="gap-2" @click="handleGeneratePlatformKey">
          <KeyRound class="h-4 w-4" />
          Generate Platform API Key
        </Button>
      </div>
    </div>

    <div v-if="loadingData" class="space-y-3">
      <Skeleton class="h-8 w-[250px]" />
      <Skeleton class="h-8 w-[400px]" />
      <Skeleton class="h-[300px] w-full mt-2" />
    </div>

    <!-- Empty State -->
    <div v-else-if="keys.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
      <div class="flex flex-col items-center text-center max-w-md">
        <div class="p-4 rounded-full bg-primary/10 mb-4">
          <KeyRound class="h-8 w-8 text-primary" />
        </div>
        <h3 class="text-xl font-semibold mb-2">No API keys yet</h3>
        <p class="text-muted-foreground mb-6">Add your first API key to connect with external services</p>
        <Button size="lg" @click="handleInsert">
          Add a key
        </Button>
      </div>
    </div>

    <!-- Keys List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="(key, index) in keys" :key="index"
        class="hover:shadow-lg transition-all duration-200 overflow-hidden h-full">
        <CardContent class="p-0 relative min-h-[250px]">
          <div class="flex items-center justify-between p-5">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound class="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold text-lg leading-tight max-w-[180px] truncate inline-block align-bottom" :title="key.key">{{ key.key }}</h3>
                <div class="flex items-center text-xs text-muted-foreground mt-0.5">
                  <Shield class="h-3 w-3 mr-1" />
                  API Key
                </div>
              </div>
            </div>
            <Badge variant="outline" class="px-2 py-0.5 shrink-0">
              {{ (key.provider) }}
            </Badge>
          </div>

          <div class="px-5 pb-5">
            <div class="mt-4 p-3 bg-muted/50 rounded-lg">
              <div class="text-xs font-medium text-muted-foreground mb-1">Full Value</div>
              <div class="flex items-center gap-1.5">
                <Lock class="h-4 w-4 text-primary mr-2" />
                <span class="font-mono break-all">{{ key.key }}</span>
              </div>
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <div class="flex justify-between items-center text-sm">
                <span class="text-muted-foreground">ID:</span>
                <span class="font-mono text-xs">{{ key.id }}...</span>
              </div>
            </div>

            <!-- Footer positioned at bottom -->
            <div class="absolute bottom-0 left-0 right-0 px-5 py-4 border-t flex justify-between items-center bg-card">
              <div>
                <div class="text-xs text-muted-foreground">Created</div>
                <div class="text-sm font-medium">
                  {{ formatDate(key.created_at) }}
                </div>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button size="icon" variant="ghost" class="h-8 w-8">
                      <MoreHorizontal class="h-4 w-4" />
                      <span class="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-[180px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem class="text-destructive focus:bg-destructive/10" @click="deleteKey(key)">
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <chatbot-confirm-dialog ref="confirmDialog" title="Please Confirm"
      description="Are your sure you want to delete this key? If this key is used in some workflow, that workflow will not work."
      confirm-text="Delete" @confirm="handleDeleteConfirm" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import {
  MoreHorizontal,
  KeyRound,
  PlusCircle,
  Shield,
  Lock,
  Trash2
} from "lucide-vue-next";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiKeysService } from "@/services";
import type { ApiKey } from "@/stores/types/apiKeys.types";
import chatbotConfirmDialog from '@/components/chatbot-confirm-dialog.vue';
import emitter from '@events';
import { formatDate } from '@/utils/globals';
import { useRouter } from "vue-router";

const router = useRouter();


const loadingData = ref(true);
const keys = ref<ApiKey[]>([]);
const keyToDelete = ref<ApiKey | null>(null);
const confirmDialog = ref();


onMounted(() => {
  getKeys();
});

const getKeys = async () => {
  try {
    loadingData.value = true;
    const result = await apiKeysService.getKeys();
    if (result.success) {
      keys.value = result.data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingData.value = false;
  }
};

const deleteKey = (key: ApiKey) => {
  keyToDelete.value = key;
  confirmDialog.value?.showDialog();
};

const handleInsert = () => {
  router.push({ name: 'keys.create' });
};

const handleGeneratePlatformKey = async () => {
  try {
    const result = await apiKeysService.generatePlatformKey();
    if (result.success) {
      emitter.emit('show-toast', {
        type: 'success',
        title: 'API Key Generated',
        message: 'A new platform API key has been created.',
      });
      await getKeys();
    } else {
      emitter.emit('show-toast', {
        type: 'error',
        title: 'Failed to Generate Platform API Key',
        message: result.message || 'An error occurred.',
      });
    }
  } catch (error) {
    emitter.emit('show-toast', {
      type: 'error',
      title: 'Failed to Generate Platform API Key',
      message: 'An error occurred while generating the key.',
    });
  }
};

const handleDeleteConfirm = async () => {
  if (!keyToDelete.value) return;

  try {
    await apiKeysService.delete(keyToDelete.value.id);

    emitter.emit('show-toast', {
      type: 'success',
      title: `Successfully deleted key: ${keyToDelete.value.key}`,
      message: 'The key has been removed from your account.',
    });
    await getKeys();
  } catch (error) {
    emitter.emit('show-toast', {
      type: 'error',
      title: `Failed to delete key: ${keyToDelete.value.key}`,
      message: 'An error occurred while deleting the key.',
    });
  } finally {
    keyToDelete.value = null;
  }
};
</script>