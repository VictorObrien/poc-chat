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
  createSystemMessage,
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
  addSystemMessage: (
    content: string,
    options?: string[],
    questionIndex?: number
  ) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => string; // Retorna o ID da mensagem criada
  addImageMessage: (imageUrl: string, label?: string) => string; // Retorna o ID da mensagem criada
  removeMessage: (messageId: string) => void;
  removeMessagesByContent: (content: string) => void;
  clearMessages: () => void;
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

      setMessages((prev) => [...prev, createAssistantMessage(text, newId)]);
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
  const {
    sendMessage: sendMessageToAPI,
    isLoading,
    error,
  } = useChatAPI({
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
  const copyMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        navigator.clipboard.writeText(message.content);
      }
    },
    [messages]
  );

  // Função para adicionar mensagem do sistema (fluxo guiado)
  const addSystemMessage = useCallback(
    (content: string, options?: string[], questionIndex?: number) => {
      const systemMessage = createSystemMessage(
        content,
        options,
        questionIndex
      );
      setMessages((prev) => [...prev, systemMessage]);
    },
    []
  );

  // Função para adicionar mensagem do usuário (sem enviar para API)
  const addUserMessage = useCallback((content: string) => {
    const userMessage = createUserMessage(content);
    setMessages((prev) => [...prev, userMessage]);
  }, []);

  // Função para adicionar mensagem do assistente (sem enviar para API)
  const addAssistantMessage = useCallback((content: string) => {
    const assistantMessage = createAssistantMessage(content);
    setMessages((prev) => [...prev, assistantMessage]);
    return assistantMessage.id;
  }, []);

  // Função para adicionar mensagem com imagem gerada
  const addImageMessage = useCallback((imageUrl: string, label?: string) => {
    const imageMessage: Message = {
      id: generateMessageId("image"),
      content: label || "Imagem gerada",
      timestamp: new Date(),
      role: "assistant",
      imageUrl: imageUrl,
    };
    setMessages((prev) => [...prev, imageMessage]);
    return imageMessage.id;
  }, []);

  // Função para remover uma mensagem específica
  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  // Função para remover mensagens por conteúdo (útil para remover "Gerando sua imagem...")
  const removeMessagesByContent = useCallback((content: string) => {
    setMessages((prev) => prev.filter((msg) => msg.content !== content));
  }, []);

  // Função para limpar mensagens
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resendMessage,
    editMessage,
    copyMessage,
    addSystemMessage,
    addUserMessage,
    addAssistantMessage,
    addImageMessage,
    removeMessage,
    removeMessagesByContent,
    clearMessages,
  };
}
