<template>
  <Card>
    <CardHeader>
      <CardTitle>Settings</CardTitle>
      <CardDescription>Manage agent configuration</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- Temperature Field -->
        <FormField v-slot="{ componentField }" name="temperature" v-model="values.temperature">
          <FormItem>
            <FormLabel>Temperature</FormLabel>
            <FormControl>
              <Input type="number" step="0.1" min="0" max="1" placeholder="Enter temperature (0-1)" class="mt-1 mb-3"
                v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- System Prompt Configuration -->
        <div class="border p-4 rounded-md mt-4">
          <h3 class="text-lg font-medium mb-4">System Prompt Configuration</h3>

          <!-- Chatbot Context Field -->
          <FormField v-slot="{ componentField }" name="chatbot_context" v-model="values.chatbot_context">
            <FormItem class="mt-2">
              <FormLabel>Chatbot Context</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter chatbot context (e.g., airline FAQ assistant)"
                  class="mt-1 mb-3 min-h-[100px]" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Key Rules / Instructions Field -->
          <div class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center">
                <label
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-2">
                  Key Rules / Instructions
                </label>
                <Badge variant="outline" class="text-xs">{{ rules.length }} / {{ MAX_RULES }} rules</Badge>
              </div>
              <Button @click="addNewRule" type="button" variant="outline" size="sm" class="h-8"
                :disabled="maxRulesReached">
                <PlusIcon class="h-4 w-4 mr-1" />
                Add Rule
              </Button>
            </div>

            <div v-if="maxRulesReached" class="text-sm text-amber-600 mb-2">
              Maximum limit of {{ MAX_RULES }} rules reached
            </div>

            <div v-if="rules.length === 0" class="text-center py-4 border rounded-md">
              <p class="text-sm text-muted-foreground">No rules added yet. Click "Add Rule" to create one.</p>
            </div>

            <div v-else class="space-y-3 mt-2">
              <div v-for="(rule, index) in rules" :key="rule.id" class="border rounded-md p-3 relative">
                <div class="flex justify-between items-start mb-2">
                  <span class="font-medium text-sm">Rule #{{ index + 1 }}</span>
                  <Button @click="() => removeRule(index)" variant="ghost" size="icon"
                    class="h-7 w-7 absolute top-2 right-2">
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
                <Textarea v-model="rule.text" placeholder="Enter a rule or instruction for your agent"
                  class="mt-1 mb-1 min-h-[80px]" />
                <div v-if="rule.text.trim() === ''" class="text-xs text-destructive mt-1">
                  Rule cannot be empty
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <Button type="submit" :disabled="!hasValidRules">
            Save Changes
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import emitter from '@/utils/eventBus';
import { Button } from "@/components/ui/button";
import { AgentService } from "@/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, XIcon } from "lucide-vue-next";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useAgentStore } from "@/stores/agent.store";
import { type BaseToastPayload } from '@/utils/eventBus';

const agentStore = useAgentStore();
const { currentAgent } = agentStore;

interface Rule {
  id: string;
  text: string;
}

const rules = ref<Rule[]>([]);
const MAX_RULES = 6;

const hasValidRules = computed(() => {
  return rules.value.length > 0 && !rules.value.some(rule => rule.text.trim() === '');
});

const maxRulesReached = computed(() => {
  return rules.value.length >= MAX_RULES;
});

const addNewRule = () => {
  if (rules.value.length >= MAX_RULES) {
    emitter.emit("show-error", {
      title: "Rule Limit Reached",
      message: `Maximum of ${MAX_RULES} rules allowed`
    } as BaseToastPayload);
    return;
  }

  rules.value.push({
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: ''
  });
};

// Function to remove a rule
const removeRule = (index: number) => {
  rules.value.splice(index, 1);
};

const formSchema = toTypedSchema(
  z.object({
    temperature: z
      .number()
      .min(0, "Temperature must be between 0 and 1")
      .max(1, "Temperature must be between 0 and 1"),
    chatbot_context: z
      .string()
      .min(10, "Context must be at least 10 characters")
      .optional(),
  })
);

const { handleSubmit, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    temperature: currentAgent?.temperature ? Number(currentAgent.temperature) : 0.7,
    chatbot_context: currentAgent?.prompt_components?.context || "",
  },
});

onMounted(() => {
  if (currentAgent?.prompt_components?.rules && currentAgent.prompt_components.rules.length > 0) {
    rules.value = currentAgent.prompt_components.rules.map(rule => ({
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: rule
    }));
  } else {
    addNewRule();
  }
});

const onSubmit = handleSubmit(async (values) => {
  if (!currentAgent) {
    emitter.emit("show-error", {
      title: "Error",
      message: "No agent selected"
    } as BaseToastPayload);
    return;
  }

  if (rules.value.length === 0) {
    emitter.emit(
      "show-error",
      {
        title: "Validation Error",
        message: "Please add at least one rule for your agent"
      } as BaseToastPayload
    );
    return;
  }

  const hasEmptyRule = rules.value.some(rule => rule.text.trim() === '');
  if (hasEmptyRule) {
    emitter.emit(
      "show-error",
      {
        title: "Validation Error",
        message: "Please fill in all the rules or remove empty ones"
      } as BaseToastPayload
    );
    return;
  }

  const formattedRules = rules.value.map(rule => rule.text.trim());

  try {
    const agentData = {
      name: currentAgent.name,
      description: currentAgent.description,
      temperature: values.temperature,
      chatbot_system_prompt: {
        context: values.chatbot_context,
        rules: formattedRules
      }
    };

    let result = await AgentService.updateAgent(currentAgent.id, agentData);
    if (result.success) {
      emitter.emit(
        "show-success",
        {
          title: "Success",
          message: "Agent settings updated successfully"
        } as BaseToastPayload
      );

      await agentStore.fetchAgentById(currentAgent.id);
    }
  } catch (err) {
    console.error(err);
    emitter.emit("show-error", {
      title: "Error",
      message: "Failed to update agent settings"
    } as BaseToastPayload);
  }
});
</script>
