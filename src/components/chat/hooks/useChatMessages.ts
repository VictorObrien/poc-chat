/**
 * Hook para gerenciar mensagens do chat
 * Encapsula toda a lógica de negócio relacionada a mensagens
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { Message } from "@/components/chat/MessageList";
import type { OpenRouterMessage } from "@/lib/types/openrouter";
import { useChatAPI } from "@/hooks/useChatAPI";
import {
  buildConversationHistory,
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
  generateMessageId,
} from "@/components/chat/utils/chat";

interface UseChatMessagesOptions {
  onMessageSent?: (hasMessages: boolean) => void;
}

interface UseChatMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => void;
  resendMessage: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  copyMessage: (messageId: string) => void;
}

/**
 * Hook que gerencia todo o estado e lógica de mensagens do chat
 */
export function useChatMessages(
  options: UseChatMessagesOptions = {}
): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentAssistantMessageIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef(false);

  // Notificar quando houver mudanças nas mensagens
  useEffect(() => {
    options.onMessageSent?.(messages.length > 0);
  }, [messages.length, options.onMessageSent]);

  // Callback para construir histórico de conversa
  const getConversationHistory = useCallback((): OpenRouterMessage[] => {
    return buildConversationHistory(messages);
  }, [messages]);

  // Handlers para streaming
  const handleStream = useCallback((text: string) => {
    if (!currentAssistantMessageIdRef.current && !isStreamingRef.current) {
      // Criar nova mensagem do assistente
      isStreamingRef.current = true;
      const newId = generateMessageId("assistant");
      currentAssistantMessageIdRef.current = newId;

      setMessages((prev) => [
        ...prev,
        createAssistantMessage(text, newId),
      ]);
    } else if (currentAssistantMessageIdRef.current) {
      // Atualizar mensagem existente
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentAssistantMessageIdRef.current
            ? { ...msg, content: text }
            : msg
        )
      );
    }
  }, []);

  const handleFinish = useCallback((text: string) => {
    if (currentAssistantMessageIdRef.current) {
      // Garantir que a mensagem final está completa
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentAssistantMessageIdRef.current
            ? { ...msg, content: text }
            : msg
        )
      );
    }
    currentAssistantMessageIdRef.current = null;
    isStreamingRef.current = false;
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error("Erro ao enviar mensagem:", error);
    currentAssistantMessageIdRef.current = null;
    isStreamingRef.current = false;

    // Adicionar mensagem de erro
    setMessages((prev) => [...prev, createErrorMessage(error)]);
  }, []);

  // Integração com API
  const { sendMessage: sendMessageToAPI, isLoading, error } = useChatAPI({
    onStream: handleStream,
    onFinish: handleFinish,
    onError: handleError,
  });

  // Função para enviar mensagem
  const sendMessage = useCallback(
    (content: string) => {
      // Resetar estado de streaming
      currentAssistantMessageIdRef.current = null;
      isStreamingRef.current = false;

      // Adicionar mensagem do usuário imediatamente
      const userMessage = createUserMessage(content);
      setMessages((prev) => [...prev, userMessage]);

      // Enviar para a API
      const conversationHistory = getConversationHistory();
      sendMessageToAPI({
        message: content,
        conversationHistory: conversationHistory.slice(0, -1), // Excluir a mensagem atual
      });
    },
    [getConversationHistory, sendMessageToAPI]
  );

  // Função para reenviar mensagem
  const resendMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        sendMessage(message.content);
      }
    },
    [messages, sendMessage]
  );

  // Função para editar mensagem
  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: newContent, timestamp: new Date() }
          : msg
      )
    );
  }, []);

  // Função para copiar mensagem
  const copyMessage = useCallback((messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resendMessage,
    editMessage,
    copyMessage,
  };
}
