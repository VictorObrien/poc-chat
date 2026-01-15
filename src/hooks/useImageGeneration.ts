/**
 * Hook para gerenciar a geração de imagens com fal.ai
 */

import { useCallback, useState } from "react";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import type { QuickActionType, InstagramFormat } from "@/lib/types/fal";

interface UseImageGenerationReturn {
  isGenerating: boolean;
  generatedImageUrl: string | null;
  error: string | null;
  generateImage: () => Promise<void>;
  resetGeneration: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const {
    setGeneratedImage,
    setError: setStoreError,
    setGenerating,
  } = useConversationFlowStore();

  const generateImage = useCallback(async () => {
    // Obter estado mais recente diretamente do store (evita problema de closure)
    const { activeFlow, responses } = useConversationFlowStore.getState();

    if (!activeFlow) {
      setError("Nenhum fluxo ativo");
      return;
    }

    if (!responses.description) {
      setError("Descrição da imagem é obrigatória");
      return;
    }

    setIsGenerating(true);
    setGenerating(true); // Atualizar store também
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch("/api/fal/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: responses.description,
          actionType: activeFlow as QuickActionType,
          format:
            (responses.format?.toLowerCase() as InstagramFormat) || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar imagem");
      }

      const data = await response.json();

      setGeneratedImageUrl(data.imageUrl);
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerating(false); // Atualizar store também
    }
  }, [setGeneratedImage, setStoreError, setGenerating]);

  const resetGeneration = useCallback(() => {
    setGeneratedImageUrl(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    generatedImageUrl,
    error,
    generateImage,
    resetGeneration,
  };
}
