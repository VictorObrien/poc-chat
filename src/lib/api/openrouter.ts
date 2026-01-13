/**
 * Serviço para integração com a API do OpenRouter usando Vercel AI SDK
 * @see https://openrouter.ai/docs/api-reference
 * @see https://sdk.vercel.ai/docs
 */

import { generateText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import type {
  OpenRouterMessage,
  OpenRouterChatResponse,
} from "../types/openrouter";

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  messages: OpenRouterMessage[];
}

/**
 * Envia uma requisição para a API do OpenRouter usando Vercel AI SDK
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<OpenRouterChatResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY não configurada. Configure a variável de ambiente OPENROUTER_API_KEY"
    );
  }

  try {
    // O provider OpenRouter usa automaticamente a variável de ambiente OPENROUTER_API_KEY
    // As configurações httpReferer e httpTitle podem ser configuradas via variáveis de ambiente
    // ou serão ignoradas se não estiverem disponíveis
    const result = await generateText({
      model: openrouter(options.model || "openai/gpt-4o-mini"),
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options.temperature ?? 0.7,
      ...(options.max_tokens && { maxTokens: options.max_tokens }),
    });

    // Extrair informações de uso (o Vercel AI SDK pode usar diferentes nomes de propriedades)
    const usage = result.usage || {};
    const promptTokens =
      "promptTokens" in usage
        ? (usage as { promptTokens: number }).promptTokens
        : "inputTokens" in usage
        ? (usage as { inputTokens: number }).inputTokens
        : 0;
    const completionTokens =
      "completionTokens" in usage
        ? (usage as { completionTokens: number }).completionTokens
        : "outputTokens" in usage
        ? (usage as { outputTokens: number }).outputTokens
        : 0;
    const totalTokens =
      "totalTokens" in usage
        ? (usage as { totalTokens: number }).totalTokens
        : promptTokens + completionTokens;

    // Retornar no formato compatível com a interface anterior
    return {
      id: result.response?.id || `chatcmpl-${Date.now()}`,
      object: "chat.completion" as const,
      created: Math.floor(Date.now() / 1000),
      model: options.model || "openai/gpt-4o-mini",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant" as const,
            content: result.text,
          },
          finish_reason: "stop" as const,
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao comunicar com a API do OpenRouter");
  }
}
