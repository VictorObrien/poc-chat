"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList, type Message } from "./MessageList";
import { useChatAPI } from "@/hooks/useChatAPI";
import type { OpenRouterMessage } from "@/lib/types/openrouter";

interface ChatSectionProps {
  onMessageSent?: (hasMessages: boolean) => void;
}

export function ChatSection({ onMessageSent }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentAssistantMessageIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef(false);

  // Notificar quando houver mudanças nas mensagens
  useEffect(() => {
    onMessageSent?.(messages.length > 0);
  }, [messages.length, onMessageSent]);

  // Construir histórico de conversa no formato OpenRouter
  const buildConversationHistory = useCallback((): OpenRouterMessage[] => {
    return messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role || "user",
        content: msg.content,
      }));
  }, [messages]);

  const { sendMessage, isLoading, error } = useChatAPI({
    onStream: (text) => {
      // Se ainda não criamos a mensagem e não estamos em streaming, criar
      if (!currentAssistantMessageIdRef.current && !isStreamingRef.current) {
        isStreamingRef.current = true;
        const newId = `assistant-${Date.now()}`;
        currentAssistantMessageIdRef.current = newId;

        setMessages((prev) => [
          ...prev,
          {
            id: newId,
            content: text,
            timestamp: new Date(),
            role: "assistant",
          },
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
    },
    onFinish: (text) => {
      // Garantir que a mensagem final está completa
      if (currentAssistantMessageIdRef.current) {
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
    },
    onError: (error) => {
      console.error("Erro ao enviar mensagem:", error);
      currentAssistantMessageIdRef.current = null;
      isStreamingRef.current = false;

      // Adicionar mensagem de erro
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Erro: ${error.message}`,
        timestamp: new Date(),
        role: "assistant",
      };

      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = async (message: string) => {
    // Resetar o ID da mensagem do assistente atual antes de enviar nova mensagem
    currentAssistantMessageIdRef.current = null;
    isStreamingRef.current = false;

    // Adicionar mensagem do usuário imediatamente
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      timestamp: new Date(),
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    // Enviar para a API
    const conversationHistory = buildConversationHistory();
    sendMessage({
      message,
      conversationHistory: conversationHistory.slice(0, -1), // Excluir a mensagem atual que acabou de ser adicionada
    });
  };

  const handleResend = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      handleSendMessage(message.content);
    }
  };

  const handleEdit = (messageId: string, newMessage: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: newMessage, timestamp: new Date() }
          : msg
      )
    );
  };

  const handleCopy = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <MessageList
        messages={messages}
        onResend={handleResend}
        onEdit={handleEdit}
        onCopy={handleCopy}
      />
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm px-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
          <span>Pensando...</span>
        </div>
      )}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Erro: {error.message}
        </div>
      )}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
