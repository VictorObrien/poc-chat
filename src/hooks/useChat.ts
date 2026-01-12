"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface UseChatOptions {
  onSend?: (message: string) => Promise<void> | void;
  onSuccess?: (message: string) => void;
  onError?: (error: Error, message: string) => void;
}

interface UseChatReturn {
  message: string;
  setMessage: (message: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  error: Error | null;
}

export function useChat({
  onSend,
  onSuccess,
  onError,
}: UseChatOptions = {}): UseChatReturn {
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async (messageToSend: string) => {
      if (onSend) {
        await onSend(messageToSend);
      }
      return messageToSend;
    },
    onSuccess: (messageSent) => {
      setMessage("");
      onSuccess?.(messageSent);
    },
    onError: (error: Error, messageSent) => {
      // Restaurar mensagem em caso de erro
      setMessage(messageSent);
      onError?.(error, messageSent);
    },
  });

  const sendMessage = () => {
    const messageToSend = message.trim();
    if (!messageToSend || mutation.isPending) return;

    mutation.mutate(messageToSend);
  };

  return {
    message,
    setMessage,
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
