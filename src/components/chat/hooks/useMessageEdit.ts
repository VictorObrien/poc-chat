/**
 * Hook para gerenciar edição de mensagens
 */

import { useState, useEffect, useCallback } from "react";
import { useTextareaAutoResize } from "./useTextareaAutoResize";

interface UseMessageEditOptions {
  initialMessage: string;
  onSave?: (newMessage: string) => void;
  onCancel?: () => void;
}

interface UseMessageEditReturn {
  isEditing: boolean;
  editedMessage: string;
  setEditedMessage: (message: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveEditing: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  canSave: boolean;
}

/**
 * Hook que gerencia o estado e lógica de edição de mensagens
 */
export function useMessageEdit(
  options: UseMessageEditOptions
): UseMessageEditReturn {
  const { initialMessage, onSave, onCancel } = options;
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(initialMessage);

  // Auto-resize do textarea durante edição
  const { textareaRef } = useTextareaAutoResize({
    value: editedMessage,
    enabled: isEditing,
  });

  // Sincronizar editedMessage quando initialMessage mudar
  useEffect(() => {
    setEditedMessage(initialMessage);
  }, [initialMessage]);

  // Focar no textarea quando entrar em modo de edição
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing, textareaRef]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditedMessage(initialMessage);
  }, [initialMessage]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedMessage(initialMessage);
    onCancel?.();
  }, [initialMessage, onCancel]);

  const saveEditing = useCallback(() => {
    const trimmedMessage = editedMessage.trim();
    if (trimmedMessage && trimmedMessage !== initialMessage) {
      onSave?.(trimmedMessage);
    }
    setIsEditing(false);
  }, [editedMessage, initialMessage, onSave]);

  const canSave =
    editedMessage.trim().length > 0 &&
    editedMessage.trim() !== initialMessage;

  return {
    isEditing,
    editedMessage,
    setEditedMessage,
    startEditing,
    cancelEditing,
    saveEditing,
    textareaRef,
    canSave,
  };
}
