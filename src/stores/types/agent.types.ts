export interface Agent {
  id: number;
  ulid: string;
  name: string;
  description: string;
  type: string;
  temperature: string;
  is_active: boolean;
  chatbot_system_prompt: string;
  created_at: string;
  prompt_components?: {
    context: string;
    rules: string[];
  };
}
