<template>
  <div class="flex min-h-screen w-full flex-col">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight pb-2">Admin Settings</h1>
          <p>Configure global system settings</p>
        </div>
      </div>

      <Tabs default-value="general" class="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form class="space-y-4" @submit.prevent="handleSubmit('general')">
                <FormField name="platform_name">
                  <FormItem>
                    <FormLabel>Platform Name</FormLabel>
                    <FormControl>
                      <Input v-model="formData.platform_name" placeholder="Enter platform name" />
                    </FormControl>
                    <FormDescription>The name of your platform as shown to users</FormDescription>
                  </FormItem>
                </FormField>

                <FormField name="support_email">
                  <FormItem>
                    <FormLabel>Support Email</FormLabel>
                    <FormControl>
                      <Input v-model="formData.support_email" type="email" placeholder="support@example.com" />
                    </FormControl>
                    <FormDescription>Email address for user support inquiries</FormDescription>
                  </FormItem>
                </FormField>

                <Button type="submit" :disabled="loading">
                  <template v-if="loading">
                    Saving...
                  </template>
                  <template v-else>
                    Save Changes
                  </template>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form class="space-y-4" @submit.prevent="handleSubmit('security')">
                <FormField name="password_policy">
                  <FormItem>
                    <FormLabel>Minimum Password Length</FormLabel>
                    <FormControl>
                      <Input v-model="formData.password_policy.min_length" type="number" min="8" max="32" />
                    </FormControl>
                    <FormDescription>Minimum number of characters required for user passwords</FormDescription>
                  </FormItem>
                </FormField>

                <FormField name="session_timeout">
                  <FormItem>
                    <FormLabel>Session Timeout (minutes)</FormLabel>
                    <FormControl>
                      <Input v-model="formData.session_timeout" type="number" min="15" />
                    </FormControl>
                    <FormDescription>How long until an inactive session expires</FormDescription>
                  </FormItem>
                </FormField>

                <Button type="submit" :disabled="loading">
                  <template v-if="loading">
                    Saving...
                  </template>
                  <template v-else>
                    Save Changes
                  </template>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API settings and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <form class="space-y-4" @submit.prevent="handleSubmit('api')">
                <FormField name="rate_limit">
                  <FormItem>
                    <FormLabel>API Rate Limit</FormLabel>
                    <FormControl>
                      <Input v-model="formData.api.rate_limit" type="number" min="0" placeholder="Requests per minute" />
                    </FormControl>
                    <FormDescription>Maximum number of API requests per minute per user</FormDescription>
                  </FormItem>
                </FormField>

                <FormField name="webhook_url">
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input v-model="formData.api.webhook_url" placeholder="https://" />
                    </FormControl>
                    <FormDescription>URL for system event notifications</FormDescription>
                  </FormItem>
                </FormField>

                <Button type="submit" :disabled="loading">
                  <template v-if="loading">
                    Saving...
                  </template>
                  <template v-else>
                    Save Changes
                  </template>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form'
import { useAdminSettingsStore } from '@/stores/admin-settings.store'
import { storeToRefs } from 'pinia'
import eventBus from '@/utils/eventBus'

const adminSettingsStore = useAdminSettingsStore()
const { settings, loading } = storeToRefs(adminSettingsStore)

const formData = ref({
  platform_name: '',
  support_email: '',
  password_policy: {
    min_length: 8
  },
  session_timeout: 30,
  api: {
    rate_limit: 100,
    webhook_url: ''
  }
})

const updateForm = () => {
  if (settings.value) {
    formData.value = { ...settings.value }
  }
}

const handleSubmit = async (section: 'general' | 'security' | 'api') => {
  try {
    let updateData = {}
    
    switch(section) {
      case 'general':
        updateData = {
          platform_name: formData.value.platform_name,
          support_email: formData.value.support_email
        }
        break
      case 'security':
        updateData = {
          password_policy: {
            min_length: formData.value.password_policy.min_length
          },
          session_timeout: formData.value.session_timeout
        }
        break
      case 'api':
        updateData = {
          api: {
            rate_limit: formData.value.api.rate_limit,
            webhook_url: formData.value.api.webhook_url
          }
        }
        break
    }

    const response = await adminSettingsStore.updateSettings(updateData)
    if (response.success) {
      eventBus.emit('show-toast', {
        type: 'success',
        title: 'Settings Updated',
        message: 'Your changes have been saved successfully.'
      })
    }
  } catch (error) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Update Failed',
      message: error instanceof Error ? error.message : 'Failed to update settings'
    })
  }
}

onMounted(async () => {
  try {
    await adminSettingsStore.getSettings()
    updateForm()
  } catch (error) {
    eventBus.emit('show-toast', {
      type: 'error',
      title: 'Error',
      message: 'Failed to load settings'
    })
  }
})
</script>
