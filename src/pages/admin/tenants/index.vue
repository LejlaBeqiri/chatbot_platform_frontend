<template>
  <div class="flex min-h-screen w-full flex-col">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight pb-2">Tenants</h1>
          <p class="text-sm text-gray-500">Manage and monitor your tenants</p>
        </div>
        <Button @click="handleCreateTenant" v-if="isAdmin">
          Create Tenant
        </Button>
      </div>

      <Card class="w-full">
        <CardContent class="p-0 sm:p-6">
          <template v-if="loading">
            <TableSkeleton />
          </template>
          <template v-else-if="error">
            <div class="p-4 text-center">
              <p class="text-red-500">{{ error }}</p>
              <Button class="mt-4" @click="loadTenants">Retry</Button>
            </div>
          </template>
          <template v-else-if="tenants.length === 0">
            <div class="p-4 text-center">
              <p class="text-muted-foreground">No tenants found</p>
            </div>
          </template>
          <template v-else>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="tenant in currentTenants" :key="tenant.id" 
                  class="cursor-pointer hover:bg-muted/50"
                  @click="viewTenant(tenant)">
                  <TableCell>{{ tenant.business_name }}</TableCell>
                  <TableCell>{{ tenant.domain }}</TableCell>
                  <TableCell>{{ tenant.country }}</TableCell>
                  <TableCell>{{ formatDate(tenant.created_at) }}</TableCell>
                  <TableCell class="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child @click.stop>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click.stop="viewTenant(tenant)">View Details</DropdownMenuItem>
                        <DropdownMenuItem @click.stop="deleteTenant(tenant)">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex justify-center py-4 border-t">
              <Pagination>
                <PaginationList class="flex items-center gap-1">
                  <PaginationFirst @click="goToPage(1)" :disabled="currentPage === 1 || loading" />
                  <PaginationPrev @click="goToPage(currentPage - 1)" :disabled="currentPage === 1 || loading" />

                  <template v-for="(item, index) in displayedPages" :key="index">
                    <PaginationListItem v-if="item.type === 'page'" :value="item.value" as-child>
                      <Button 
                        class="w-10 h-9 p-0" 
                        :variant="item.value === currentPage ? 'default' : 'outline'"
                        @click="goToPage(item.value)"
                        :disabled="loading"
                      >
                        {{ item.value }}
                      </Button>
                    </PaginationListItem>
                    <PaginationEllipsis v-else-if="item.type === 'ellipsis'" :key="'ellipsis-' + index" :index="index" />
                  </template>

                  <PaginationNext @click="goToPage(currentPage + 1)" 
                    :disabled="currentPage === totalPages || loading" />
                  <PaginationLast @click="goToPage(totalPages)" 
                    :disabled="currentPage === totalPages || loading" />
                </PaginationList>
              </Pagination>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>

    <chatbot-confirm-dialog
      ref="confirmDialog"
      title="Delete Tenant"
      description="Are you sure you want to delete this tenant? This action cannot be undone and will remove all associated data."
      confirm-text="Delete"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Tenant } from '@/stores/types/tenant.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-vue-next'
import TableSkeleton from '@/components/skeletons/table-skeleton.vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'
import { useAdminStore } from '@/stores/admin.store'
import { storeToRefs } from 'pinia'
import eventBus from '@/utils/eventBus'
import chatbotConfirmDialog from '@/components/chatbot-confirm-dialog.vue'
import { formatDate, calculateDisplayedPages } from '@/utils/globals'
import { useAuthStore } from '@/stores/auth.store'; 

const router = useRouter()
const adminStore = useAdminStore()
const authStore = useAuthStore(); 
const { tenants, loading, error } = storeToRefs(adminStore)
const confirmDialog = ref()
const tenantToDelete = ref<Tenant | null>(null)

const isAdmin = computed(() => authStore.user?.role === 'admin');

const currentTenants = computed(() => tenants.value || [])
const currentPage = computed(() => adminStore.paginationMeta?.current_page || 1)
const totalPages = computed(() => adminStore.paginationMeta?.last_page || 1)

const displayedPages = computed(() => {
  return calculateDisplayedPages({
    current_page: currentPage.value,
    last_page: totalPages.value
  });
});

const loadTenants = async (page: number = 1) => {
  try {
    await adminStore.getTenants(page)
  } catch (error) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Error',
      message: 'Failed to load tenants'
    })
  }
}

const goToPage = async (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    await loadTenants(page);
  }
};

const viewTenant = (tenant: Tenant) => {

  router.push(`/user/tenants/${tenant.id}`) 
}

const handleCreateTenant = () => {
  router.push({ name: 'admin.tenants.create' }); 
};

const deleteTenant = (tenant: Tenant) => {
  tenantToDelete.value = tenant
  confirmDialog.value?.showDialog()
}

const handleDeleteConfirm = async () => {
  if (!tenantToDelete.value) return

  try {
    const response = await adminStore.deleteTenant(tenantToDelete.value.id)
    if (response.success) {
      eventBus.emit('show-toast', {
        type: 'success',
        title: 'Tenant Deleted',
        message: 'The tenant has been removed successfully.'
      })
      await loadTenants(currentPage.value)
    }
  } catch (error) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Delete Failed',
      message: error instanceof Error ? error.message : 'Failed to delete tenant'
    })
  } finally {
    tenantToDelete.value = null
  }
}

onMounted(() => {
  loadTenants(1)
})
</script>
