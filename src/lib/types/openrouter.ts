/**
 * Tipos TypeScript para a API do OpenRouter
 * @see https://openrouter.ai/docs/api-reference
 */

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterChatRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterChoice {
  index: number;
  message: {
    role: "assistant";
    content: string;
  };
  finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | null;
}

export interface OpenRouterChatResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage: OpenRouterUsage;
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}
