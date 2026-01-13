/**
 * Hook para gerenciar operações de cópia para clipboard com feedback visual
 */

import { useState, useCallback } from "react";
import { copyToClipboard } from "../utils/clipboard";

interface UseCopyToClipboardOptions {
  onCopy?: () => void;
  feedbackDuration?: number;
}

interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

/**
 * Hook que gerencia cópia para clipboard com estado de feedback
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { onCopy, feedbackDuration = 2000 } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      await copyToClipboard(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), feedbackDuration);
    },
    [onCopy, feedbackDuration]
  );

  return { copied, copy };
}
