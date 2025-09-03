<template>
  <Card v-if="authData.user">
    <CardHeader>
      <CardTitle>User Profile</CardTitle>
      <CardDescription>View your profile details</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-6">
        <FormField v-slot="{ componentField }" name="email" v-model="authData.user.email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="text" placeholder="First Name" disabled class="mt-1" v-bind="componentField" readonly />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>



        <div class="change-password-section">
          <FormField v-slot="{ componentField }" name="old_password" v-model="oldPassword">
            <FormItem>
              <FormLabel>Old Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Old Password" class="mt-1" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="new_password" v-model="newPassword">
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="New Password" class="mt-1" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password_confirmation" v-model="passwordConfirmation">
            <FormItem>
              <FormLabel>Password Confirmation</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm Password" class="mt-1" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </form>
    </CardContent>
    <CardFooter class="border-t px-6 py-4">
      <Button @click="handleChangePassword">Change Password</Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import emitter from '@events'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AuthService } from "@/services/auth.service";

const authStore = useAuthStore();

const authData = ref({
  user: authStore.user,
  loggedIn: authStore.loggedIn,
});

const oldPassword = ref("");
const newPassword = ref("");
const passwordConfirmation = ref("");

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

const handleChangePassword = async () => {
  try {
    const response = await AuthService.changePassword(
      oldPassword.value,
      newPassword.value,
      passwordConfirmation.value
    );

    if (response.success) {
      emitter.emit("show-toast", {
        type: "success",
        title: "Password Changed Successfully",
        message: "Your password has been updated."
      });
    }
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      const errorMsg = error.response.data.message || "Validation error occurred.";
      emitter.emit("show-error", {
        title: "Failed to Change Password",
        message: errorMsg
      });
    } else if (error.response && error.response.status === 401) {
      const errorMsg = error.response.data.message || "Unauthorized access.";
      emitter.emit("show-error", {
        title: "Wrong Credentials",
        message: errorMsg
      });
    } else {
      emitter.emit("show-error", {
        title: "Failed to Change Password",
        message: "An unexpected error occurred."
      });
    }

  }
};

</script>

<style scoped>
.change-password-section {
  margin-top: 2rem;
}

.change-password-section .error {
  color: red;
  margin-top: 0.5rem;
}

.change-password-section .success {
  color: green;
  margin-top: 0.5rem;
}
</style>
