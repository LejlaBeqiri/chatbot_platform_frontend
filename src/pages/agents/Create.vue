<template>
  <div class="flex min-h-screen w-full flex-col">
    <main class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <RouterLink to="/user/dashboard"> Dashboard </RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <RouterLink to="/user/agents"> Agents </RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink as-child> Create your Ai Agent </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div class="grid w-full max-w-6xl gap-1">
        <h1 class="text-3xl font-semibold">Create your new agent</h1>
      </div>
      <div class="grid w-full items-start gap-6">
        <div class="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Name</CardTitle>
              <CardDescription>
                A unique identifier for your AI agent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="createAgentForm" @submit.prevent="onSubmit" class="space-y-4">
                <FormField v-slot="{ componentField }" name="agent_name" v-model="values.agent_name">
                  <FormItem>
                    <FormLabel>What should we call your agent?</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter your agent's name" class="mt-1 mb-3"
                        v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="description" v-model="values.description">
                  <FormItem>
                    <FormLabel>Agent description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter agent description" class="mt-1 mb-3 min-h-[100px]"
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

                <FormField name="agent_type" v-model="selectedAgentType">
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name="platform" v-model="selectedPlatform">
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </form>
            </CardContent>
          </Card>

          <CardFooter class="border-t px-6 py-4">
            <Button @click="onSubmit" :disabled="!hasValidRules
              ">
              Create your agent
            </Button>
          </CardFooter>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import emitter from '@/utils/eventBus';
import { Button } from "@/components/ui/button";
import { AgentService } from "@/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  PlusIcon,
  XIcon,
} from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// START FORM
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

const router = useRouter();

const selectedAgentType = ref(null);
const selectedPlatform = ref(null);


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
    emitter.emit('show-toast', {
      type: 'error',
      title: 'Rule Limit',
      message: `Maximum of ${MAX_RULES} rules allowed`,
    });
    return;
  }
  rules.value.push({
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: ''
  });
};

const removeRule = (index: number) => {
  rules.value.splice(index, 1);
};


onMounted(() => {
  addNewRule();
});

const formSchema = toTypedSchema(
  z.object({
    agent_name: z
      .string({ required_error: "Please enter agent name." })
      .min(5, "Agent name with at least 5 chars is required")
      .max(50, "Agent name cannot be more then 50 chars"),

    description: z
      .string()
      .optional(),

    chatbot_context: z
      .string()
      .min(10, "Context must be at least 10 characters")
      .optional(),
  })
);

const { handleSubmit, meta, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    agent_name: "",
    description: "",
    chatbot_context: "",
  },
});

const onSubmit = handleSubmit(async (values) => {
  if (rules.value.length === 0) {
    emitter.emit('show-toast', {
      type: 'error',
      title: 'Missing Rules',
      message: 'Please add at least one rule for your agent',
    });
    return;
  }
  const hasEmptyRule = rules.value.some(rule => rule.text.trim() === '');
  if (hasEmptyRule) {
    emitter.emit('show-toast', {
      type: 'error',
      title: 'Empty Rule',
      message: 'Please fill in all the rules or remove empty ones',
    });
    return;
  }

  const formattedRules = rules.value.map(rule => rule.text.trim());

  try {
    const agentData = {
      name: values.agent_name,
      description: values.description,
      temperature: 0.7,
      chatbot_system_prompt: {
        context: values.chatbot_context,
        rules: formattedRules
      }
    };

    console.log('Sending agent data:', JSON.stringify(agentData));

    let result = await AgentService.createAgent(agentData);

    if (result.success) {
      router.push({
        name: "agents.details",
        params: {
          id: result.data.id,
        },
      });
      emitter.emit('show-toast', {
        type: 'success',
        title: 'Agent Created',
        message: 'Agent was created successfully',
      });
    }
  } catch (err) {
    console.error(err);
    emitter.emit('show-toast', {
      type: 'error',
      title: 'Agent Creation Failed',
      message: 'Failed to create agent',
    });
  }
});
</script>

<style scoped>
.integration_icon {
  width: 50px;
  height: 50px;
  padding: 13px;
}

.edit_icon {
  width: 12px !important;
}
</style>
