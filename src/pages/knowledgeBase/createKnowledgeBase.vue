<template>
  <div class="flex min-h-screen w-full flex-col">
    <main
      class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4"
    >
      <div class="grid w-full max-w-6xl gap-2">
        <h1 class="text-3xl font-semibold">Create Knowledge Base</h1>
      </div>
      <div
        class="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[550px_1fr]"
      >
        <div class="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Details</CardTitle>
              <CardDescription>
                Create a new knowledge base for your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <FormField v-slot="{ componentField }" name="name">
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Knowledge Base Name"
                        class="mt-1 mb-3"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="description">
                  <FormItem class="mt-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        placeholder="Enter a description"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly describe the purpose of this knowledge base
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </form>
            </CardContent>
            <CardFooter class="border-t px-6 py-4">
              <Button @click="onSubmit" :disabled="!meta.valid || !meta.dirty"
                >Create</Button
              >
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { KnowledgeBaseService } from "@/services/knowledge.service";

const router = useRouter();

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: "Please enter a name for the knowledge base." })
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot be more than 50 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description cannot be more than 500 characters").optional()
  })
);

const { handleSubmit, meta, values } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const result = await KnowledgeBaseService.createKnowledgeBase({
      name: values.name,
      description: values.description || '',
    });

    if (result.success && result.data) {
      toast({
        title: "Success",
        description: result.message || "Knowledge base created successfully",
      });
      router.push({
        name: "knowledgebase.details",
        params : {
          id: result.data.id
        }
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

</script>