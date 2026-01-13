"use client";

import { useState } from "react";
import type { OpenRouterMessage } from "@/lib/types/openrouter";

interface UseChatAPIOptions {
  onStream?: (text: string) => void;
  onFinish?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useChatAPI(options: UseChatAPIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async ({
    message,
    conversationHistory,
  }: {
    message: string;
    conversationHistory?: OpenRouterMessage[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar mensagem");
      }

      if (!response.body) {
        throw new Error("Resposta sem corpo");
      }

      // Processar o stream de texto (formato do Vercel AI SDK toTextStreamResponse)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // O formato toTextStreamResponse retorna texto puro incrementalmente
        // Cada chunk pode conter parte do texto
        accumulatedText += chunk;
        options.onStream?.(accumulatedText);
      }

      setIsLoading(false);
      options.onFinish?.(accumulatedText);
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
  };
}
