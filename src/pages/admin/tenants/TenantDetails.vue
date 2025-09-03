<template>
  <div class="p-4 sm:p-6">
    <template v-if="loading">
      <p>Loading tenant details...</p>
    </template>
    <template v-else-if="error">
      <p class="text-red-500">Error loading tenant details: {{ error }}</p>
      <Button class="mt-4" @click="fetchTenantDetails">Retry</Button>
    </template>
    <template v-else-if="tenant">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold tracking-tight">{{ tenant.business_name }}</h1>
        <div>
          <Button @click="updateTenantDetails" class="mr-2">Update Tenant</Button>
          <Button variant="outline" @click="goBack">Back to Tenants</Button>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4">
            <div class="grid gap-2">
              <Label for="businessName">Business Name</Label>
              <Input id="businessName" v-model="tenant.business_name" />
            </div>
            <div class="grid gap-2">
              <Label for="country">Country</Label>
              <Input id="country" v-model="tenant.country" />
            </div>
             <div class="grid gap-2">
              <Label for="industry">Industry</Label>
              <Input id="industry" v-model="tenant.industry" />
            </div>
             <div class="grid gap-2">
              <Label for="domain">Domain</Label>
              <Input id="domain" v-model="tenant.domain" />
            </div>
             <div class="grid gap-2">
              <Label for="phone">Phone</Label>
              <Input id="phone" v-model="tenant.phone" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Created At</p>
              <p>{{ formatDate(tenant.created_at) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Updated At</p>
              <p>{{ formatDate(tenant.updated_at) }}</p>
            </div>
          </CardContent>
        </Card>

        <Card v-if="tenant.user">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4">
            <div class="grid gap-2">
              <Label for="firstName">First Name</Label>
              <Input id="firstName" v-model="tenant.user.first_name" />
            </div>
            <div class="grid gap-2">
              <Label for="lastName">Last Name</Label>
              <Input id="lastName" v-model="tenant.user.last_name" />
            </div>
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input id="email" type="email" v-model="tenant.user.email" />
            </div>
             <div>
              <p class="text-sm font-medium text-muted-foreground">Role</p>
              <p>{{ tenant.user.role || 'Tenant'}}</p>
            </div>
          </CardContent>
          <CardFooter>
          
          </CardFooter>
        </Card>
      </div>

    </template>
    <template v-else>
      <p>Tenant not found.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin.store';
import type { Tenant } from '@/stores/types/tenant.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label'; 
import { formatDate } from '@/utils/globals';
import eventBus from '@/utils/eventBus';
import CardFooter from '@/components/ui/card/CardFooter.vue';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const tenant = ref<Tenant | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const isUpdating = ref(false); 

const fetchTenantDetails = async () => {
  loading.value = true;
  error.value = null;
  const tenantId = route.params.id as string;

  if (!tenantId) {
    error.value = 'Tenant ID is missing.';
    loading.value = false;
    return;
  }

  try {
  
    const parsedTenantId = parseInt(tenantId, 10);
    if (isNaN(parsedTenantId)) {
        throw new Error('Invalid Tenant ID format.');
    }
    const fetchedTenant = await adminStore.getTenantById(parsedTenantId);
    tenant.value = fetchedTenant.data; 
  } catch (err) {
    console.error('Failed to fetch tenant details:', err);
    error.value = err instanceof Error ? err.message : 'An unknown error occurred.';
     eventBus.emit('show-toast', {
        type: 'error',
        title: 'Error Loading Tenant',
        message: `Failed to load tenant details: ${error.value}`
      });
  } finally {
    loading.value = false;
  }
};

const updateTenantDetails = async () => {
  if (!tenant.value || !tenant.value.id) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Update Error',
      message: 'Cannot update tenant: Tenant data is missing or invalid.'
    });
    return;
  }

  isUpdating.value = true;
  try {
    
    const updatePayload = { ...tenant.value };
    
    await adminStore.updateTenant(tenant.value.id, updatePayload);

    eventBus.emit('show-toast', {
      type: 'success',
      title: 'Tenant Updated',
      message: `${tenant.value.business_name} details updated successfully.`
    });

  } catch (err) {
    console.error('Failed to update tenant details:', err);
    const updateError = err instanceof Error ? err.message : 'An unknown error occurred.';
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Update Failed',
      message: `Failed to update tenant: ${updateError}`
    });
  } finally {
    isUpdating.value = false;
  }
};

const goBack = () => {
  router.push('/user/tenants'); 
};

onMounted(() => {
  fetchTenantDetails();
});
</script>