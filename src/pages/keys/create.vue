<template>
  <div class="flex min-h-screen w-full flex-col">
    <main class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4">
      <div class="grid w-full max-w-6xl gap-2">
        <h1 class="text-3xl font-semibold">Api Keys</h1>
      </div>
      <div class="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[550px_1fr]">
        <div class="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a New API Keys</CardTitle>
              <CardDescription>
                To integrate with external services, create an API key below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <FormField v-slot="{ componentField }" name="key">
                  <FormItem class="mt-4">
                    <FormLabel>Your secret key</FormLabel>
                    <FormControl>
                      <div class="flex gap-2">
                        <Input :type="keyVisible ? 'text' : 'password'" placeholder="Enter your secret key"
                          class="mt-1 mb-3" v-bind="componentField" />
                        <Button variant="outline" size="icon" @click.prevent="toggleKeyVisibility"
                          class="flex h-9  rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1 mb-3">

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Eye class="h-4 w-4" v-if="!keyVisible" />
                                <EyeOff class="h-4 w-4" v-if="keyVisible" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <template v-if="!keyVisible">
                                  Show Secret Key
                                </template>
                                <template v-else>
                                  Hide Secret Key
                                </template>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Button>
                      </div>
                    </FormControl>
                    <chatbotInfoText type="info">
                      <p><span>For security reasons</span>, only the last few digits of your API key will be shown in
                        the list. The full key
                        will
                        never be exposed. Be sure to save the full key securely when it's first generated.</p>
                    </chatbotInfoText>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </form>
            </CardContent>
            <CardFooter class="border-t px-6 py-4">
              <Button @click="onSubmit" :disabled="!meta.valid || !meta.dirty">Create</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast/use-toast";
import { useRouter } from "vue-router";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "vee-validate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { apiKeysService } from "@/services";
import chatbotInfoText from "@/components/chatbot-info-text.vue";
import { Eye, EyeOff } from 'lucide-vue-next'
const router = useRouter();

const keyVisible = ref(false)
// Form Schema
const formSchema = toTypedSchema(
  z.object({
    key: z
      .string({ required_error: "Please enter a key." })
      .min(10, "Key must be at least 10 characters")
      .max(500, "Key cannot be more than 500 characters"),
  })
);

const { handleSubmit, meta } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const result = await apiKeysService.post({
      key: values.key
    });

    if (result.success) {
      toast({
        title: "Success",
        description: result.message || "Knowledge base created successfully",
      });
      router.push({
        name: "keys.index",
      });
    } else {
      throw new Error(result.message || "Failed to create knowledge base");
    }
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to create knowledge base",
      variant: "destructive",
    });
  }
});


const toggleKeyVisibility = () => {
  keyVisible.value = !keyVisible.value
}


</script>