/**
 * Hook para gerenciar a geração de imagens com fal.ai
 * Usa o novo sistema de 7 perguntas para construir prompts otimizados
 */

import { useCallback, useState } from "react";
import { useConversationFlowStore } from "@/stores/conversationFlowStore";
import type { QuickActionType } from "@/lib/types/fal";
import { buildFinalPrompt } from "@/lib/types/fal";

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

    // Verificar se tem respostas suficientes
    const hasResponses = Object.keys(responses).length > 0;
    if (!hasResponses) {
      setError("Responda as perguntas para gerar a imagem");
      return;
    }

    setIsGenerating(true);
    setGenerating(true); // Atualizar store também
    setError(null);
    setGeneratedImageUrl(null);

    try {
      // Construir prompt final usando o novo sistema de 7 perguntas
      const finalPrompt = buildFinalPrompt(
        activeFlow as QuickActionType,
        responses
      );

      console.log("Prompt construído:", finalPrompt);

      const response = await fetch("/api/fal/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          actionType: activeFlow as QuickActionType,
          // Passar tipo de publicação para determinar dimensões
          tipoPublicacao: responses.tipo_publicacao,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar imagem");
      }

      const data = await response.json();

      console.log("Imagem gerada:", {
        imageUrl: data.imageUrl,
        dimensions: data.dimensions,
        timings: data.timings,
      });

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
