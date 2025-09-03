<template>
  <Card v-if="authData.user?.tenant">
    <CardHeader>
      <CardTitle>User Profile</CardTitle>
      <CardDescription>View your profile details</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-6">
        <FormField v-slot="{ componentField }" name="first_name" v-model="authData.user.first_name">
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="First Name" disabled class="mt-1" v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="last_name" v-model="authData.user.last_name">
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Last Name" class="mt-1" disabled v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="business_name" v-model="authData.user.tenant.business_name">
          <FormItem>
            <FormLabel>Business Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Business Name" class="mt-1" disabled v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="industry" v-model="authData.user.tenant.industry">
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Industry" class="mt-1" disabled v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="domain" v-model="authData.user.tenant.domain">
          <FormItem>
            <FormLabel>Domain</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Domain" class="mt-1" v-bind="componentField"  />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="country" v-model="authData.user.tenant.country">
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Country" class="mt-1" disabled v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="language" v-model="authData.user.tenant.language">
          <FormItem>
            <FormLabel>Language</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Language" class="mt-1" disabled v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone" v-model="authData.user.tenant.phone">
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Phone" class="mt-1" disabled v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

      </form>
      <div class="flex justify-end mt-8">
        <Button size="lg" @click="handleChangeDomain" :disabled="isChangingDomain">
          {{ isChangingDomain ? 'Updating...' : 'Update Domain' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>


<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AuthService } from '@/services/auth.service';
import eventBus from '@/utils/eventBus';
import { Button } from '@/components/ui/button';

const authStore = useAuthStore();

const authData = ref({
  user: authStore.user,
  loggedIn: authStore.loggedIn,
});

const isChangingDomain = ref(false);

const handleChangeDomain = async () => {
  const domain = authData.value.user?.tenant?.domain;
  if (!domain) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Update Error',
      message: 'Domain value is missing.'
    });
    return;
  }
  isChangingDomain.value = true;
  try {
    const response = await AuthService.changeDomain(domain);
    if (response.success) {
      eventBus.emit('show-toast', {
        type: 'success',
        title: 'Domain Updated',
        message: 'Domain updated successfully.'
      });
    } else {
      eventBus.emit('show-toast', {
        type: 'error',
        title: 'Update Failed',
        message: response.message || 'Failed to update domain.'
      });
    }
  } catch (err) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Update Failed',
      message: err instanceof Error ? err.message : 'Failed to update domain.'
    });
  } finally {
    isChangingDomain.value = false;
  }
};

onMounted(() => {
  if (!authStore.user) {
    authStore.getAuthData();
  }
});

watch(
  () => authStore.user,
  (newUser) => {
    authData.value.user = newUser;
  }
);
</script>
