<script setup lang="ts">
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-vue-next";
import { ref, reactive } from "vue";
import { AuthService } from "@/services";
import { z } from "zod";
import { useRouter } from "vue-router";
import eventBus from '@/utils/eventBus';

const router = useRouter();
const isLoading = ref(false);
const errors = reactive({
  email: "",
  password: "",
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(3, "Password must be at least 6 characters"),
});

const formData = reactive({
  email: "user@test.com",
  password: "12345678",
});

const validateForm = () => {
  try {
    loginSchema.parse(formData);
    errors.email = "";
    errors.password = "";
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        if (err.path[0] === "email") errors.email = err.message;
        if (err.path[0] === "password") errors.password = err.message;
      });
    }
    return false;
  }
};

const onSubmit = async (event: Event) => {
  event.preventDefault();

  if (!validateForm()) return;

  isLoading.value = true;
  try {
    const response = await AuthService.login({
      email: formData.email,
      password: formData.password,
    });
    if (response.success) {
      router.push({ name: "dashboard" });
    }
  } catch (error) {
    eventBus.emit('show-toast', {
        type: 'error',
        title: 'Login Failed',
        message: 'Check Credentials!'
      });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit="onSubmit">
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" v-model="formData.email" placeholder="name@example.com" type="email" auto-capitalize="none"
            auto-complete="email" auto-correct="off" :disabled="isLoading" @blur="validateForm" />
          <span v-if="errors.email" class="text-sm text-red-500">{{
    errors.email
  }}</span>
        </div>

        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input id="password" v-model="formData.password" placeholder="Enter your password" type="password"
            auto-capitalize="none" auto-complete="current-password" :disabled="isLoading" @blur="validateForm" />
          <span v-if="errors.password" class="text-sm text-red-500">{{
    errors.password
  }}</span>
        </div>

        <Button type="submit" :disabled="isLoading">

          Sign In with Email
          <Loader v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        </Button>
      </div>
    </form>
  </div>
</template>
