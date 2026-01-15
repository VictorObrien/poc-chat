/**
 * Hook para gerenciar input de chat
 */

import { useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useTextareaAutoResize } from "./useTextareaAutoResize";

interface UseChatInputOptions {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

interface UseChatInputReturn {
  message: string;
  setMessage: (message: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  resetHeight: () => void;
}

/**
 * Hook que gerencia o estado e lógica do input de chat
 */
export function useChatInput(
  options: UseChatInputOptions = {}
): UseChatInputReturn {
  const { onSend, disabled = false } = options;

  const { message, setMessage, sendMessage, isLoading } = useChat({
    onSend,
  });

  const { textareaRef, resetHeight } = useTextareaAutoResize({
    value: message,
    enabled: !disabled,
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        resetHeight();
      }
    },
    [sendMessage, resetHeight]
  );

  return {
    message,
    setMessage,
    sendMessage,
    isLoading,
    textareaRef,
    handleKeyDown,
    resetHeight,
  };
}
