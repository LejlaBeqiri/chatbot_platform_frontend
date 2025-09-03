<template>
  <div class="flex min-h-screen w-full flex-col">
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight pb-2">Create New Tenant</h1>
          <p class="text-sm text-gray-500">Fill in the details below to register a new tenant and their primary user.</p>
        </div>
        <Button variant="outline" @click="goBack">Back to Tenants</Button>
      </div>

      <Card>
        <CardContent class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <h2 class="text-xl font-semibold border-b pb-2 mb-4">User Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="firstName">First Name</Label>
                <Input id="firstName" v-model="formData.user.first_name" required />
              </div>
              <div class="space-y-2">
                <Label for="lastName">Last Name</Label>
                <Input id="lastName" v-model="formData.user.last_name" required />
              </div>
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input id="email" type="email" v-model="formData.user.email" required />
              </div>
              <div class="space-y-2">
                <Label for="password">Password</Label>
                <Input id="password" type="password" v-model="formData.user.password" required />
              </div>
              <div class="space-y-2">
                <Label for="passwordConfirmation">Confirm Password</Label>
                <Input id="passwordConfirmation" type="password" v-model="formData.user.password_confirmation" required />
              </div>
            </div>

            <!-- Tenant Details -->
            <h2 class="text-xl font-semibold border-b pb-2 mb-4 pt-4">Tenant Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="businessName">Business Name</Label>
                <Input id="businessName" v-model="formData.tenant.business_name" required />
              </div>
              <div class="space-y-2">
                <Label for="industry">Industry</Label>
                <Input id="industry" v-model="formData.tenant.industry" required />
              </div>
              <div class="space-y-2">
                <Label for="phone">Phone</Label>
                <Input id="phone" v-model="formData.tenant.phone" required />
              </div>
              <div class="space-y-2">
                <Label for="country">Country (2-letter code)</Label>
                <Input id="country" v-model="formData.tenant.country" required maxlength="2" />
              </div>
              <div class="space-y-2">
                <Label for="language">Language (2-letter code)</Label>
                <Input id="language" v-model="formData.tenant.language" required maxlength="2" />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" @click="goBack">Cancel</Button>
              <Button type="submit" :disabled="loading">{{ loading ? 'Creating...' : 'Create Tenant' }}</Button>
            </div>
            <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminStore } from '@/stores/admin.store';
import eventBus from '@/utils/eventBus';

const router = useRouter();
const adminStore = useAdminStore();
const loading = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  user: {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  },
  tenant: {
    business_name: '',
    industry: '',
    logo: null as File | null,
    country: '',
    language: '',
    phone: '',
  },
});


const goBack = () => {
  router.push({ name: 'admin.tenants' });
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  if (formData.value.user.password !== formData.value.user.password_confirmation) {
    error.value = 'Passwords do not match.';
    loading.value = false;
    return;
  }

  const payload = new FormData();

  Object.entries(formData.value.user).forEach(([key, value]) => {
    payload.append(`user[${key}]`, value);
  });

  Object.entries(formData.value.tenant).forEach(([key, value]) => {
    if (value !== null) { 
        payload.append(`tenant[${key}]`, value);
    }
  });

  try {
    const response = await adminStore.createTenant(payload);
    if (response.success) {
      eventBus.emit('show-toast', {
        type: 'success',
        title: 'Tenant Created',
        message: `Tenant ${formData.value.tenant.business_name} created successfully.`,
      });
      router.push({ name: 'admin.tenants' });
    } else {
      
        error.value = adminStore.error || 'Failed to create tenant. Please check the details.';
    }
  } catch (err) {
    console.error('Tenant creation error:', err);
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred during tenant creation.';
    eventBus.emit('show-toast', {
        type: 'error',
        title: 'Creation Failed',
        message: error.value
    });
  } finally {
    loading.value = false;
  }
};
</script>