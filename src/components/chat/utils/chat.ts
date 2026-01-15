/**
 * Funções utilitárias para manipulação de mensagens e conversas
 */

import type { Message } from "@/components/chat/MessageList";
import type { OpenRouterMessage } from "@/lib/types/openrouter";

/**
 * Converte mensagens do formato interno para o formato OpenRouter
 */
export function buildConversationHistory(
  messages: Message[]
): OpenRouterMessage[] {
  return messages
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role || "user",
      content: msg.content,
    }));
}

/**
 * Cria uma nova mensagem do usuário
 */
export function createUserMessage(content: string): Message {
  return {
    id: `user-${Date.now()}`,
    content,
    timestamp: new Date(),
    role: "user",
  };
}

/**
 * Cria uma nova mensagem do assistente
 */
export function createAssistantMessage(content: string, id?: string): Message {
  return {
    id: id || `assistant-${Date.now()}`,
    content,
    timestamp: new Date(),
    role: "assistant",
  };
}

/**
 * Cria uma mensagem de erro
 */
export function createErrorMessage(error: Error): Message {
  return {
    id: `error-${Date.now()}`,
    content: `Erro: ${error.message}`,
    timestamp: new Date(),
    role: "assistant",
  };
}

/**
 * Gera um ID único para mensagens
 */
export function generateMessageId(prefix: string = "msg"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cria uma mensagem do sistema (para fluxo guiado)
 */
export function createSystemMessage(
  content: string,
  options?: string[]
): Message {
  return {
    id: generateMessageId("system"),
    content,
    timestamp: new Date(),
    role: "system",
    options,
  };
}
