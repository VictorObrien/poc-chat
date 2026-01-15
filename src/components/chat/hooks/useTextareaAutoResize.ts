/**
 * Hook para gerenciar auto-resize de textarea
 */

import { useEffect, useRef, RefObject } from "react";
import { autoResizeTextarea, resetTextareaHeight } from "../utils/textarea";

interface UseTextareaAutoResizeOptions {
  value: string;
  maxHeight?: number;
  enabled?: boolean;
}

interface UseTextareaAutoResizeReturn {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  resetHeight: () => void;
}

/**
 * Hook que gerencia o auto-resize de um textarea baseado no conteúdo
 */
export function useTextareaAutoResize(
  options: UseTextareaAutoResizeOptions
): UseTextareaAutoResizeReturn {
  const { value, maxHeight, enabled = true } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (enabled && textareaRef.current) {
      autoResizeTextarea(textareaRef.current, maxHeight);
    }
  }, [value, maxHeight, enabled]);

  const resetHeight = () => {
    resetTextareaHeight(textareaRef.current);
  };

  return { textareaRef, resetHeight };
}
